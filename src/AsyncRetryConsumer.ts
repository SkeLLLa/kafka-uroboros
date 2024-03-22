import EventEmitter from 'node:events';
import {
  EachBatchHandler,
  EachMessageHandler,
  IHeaders,
  KafkaMessage,
  type Producer,
} from 'kafkajs';
import { AsyncRetryConsumerHeaders } from './AsyncRetryConsumerHeaders';
import {
  AsyncRetryConsumerError,
  EAsyncRetryConsumerErrorCode,
} from './errors/AsyncRetryConsumerError';
import { DeadLetter } from './errors/DeadLetter';
import { PauseProcessing } from './errors/PauseProcessing';
import {
  EAsyncRetryConsumerEvents,
  type IAsyncRetryConsumerEventMap,
  type IEventPayload,
} from './types/AsyncRetryConsumerEvents';
import type {
  IAsyncRetryConsumerMessageDetails,
  IAsyncRetryConsumerMessageHeaders,
  TAsyncRetryConsumerBatchHandler,
  TAsyncRetryConsumerMessageHandler,
} from './types/AsyncRetryConsumerMessage';
import {
  TopicNameStrategy,
  type TTopicNameStrategyFactory,
} from './utils/TopicNameStrategy';

/**
 * Available topics
 * @internal
 */
export interface ITopics {
  retries: string[];
  dlq: [string];
  original: [string];
}

/**
 * Async retry consumer options
 * @public
 */
export interface IAsyncRetryConsumerOptions {
  /**
   * The consumer topic that this async retry consumer is handling messages for.
   **/
  topic: string;
  /**
   * The consumer group id.
   **/
  groupId?: string | undefined;
  /**
   * A previously configured (and connected) producer that can be used to publish messages into the appropriate delay and retry topics
   **/
  producer: Pick<Producer, 'send'>;
  /**
   * The maximum number of retries for a given message
   * @defaultValue `5`
   **/
  maxRetries?: number;
  /**
   * The amount of time (in milliseconds) to block an `eachMessage` call while waiting until a retry message is ready to be processed. Waits above this amount will result in the consumer pausing on the topic/partition until the message is ready.
   * @defaultValue `5000`
   **/
  maxWaitTime?: number;
  /**
   * A series of delays (in seconds) that will be used for each corresponding retry attempt
   * @defaultValue `[30, 150, 750, 3750, 18750]`
   **/
  retryDelaysSeconds?: number[];
  /**
   * Retry topic name strategy
   */
  topicNameStrategy: TTopicNameStrategyFactory;
}

type TTopicPartition = `${string}:${number}`;

/**
 * A helper that can be used with KafkaJS to facilitate consuming messages with retries of messages that were failed during the main consumption process without blocking other messages in queue.
 * @public
 */
export class AsyncRetryConsumer extends EventEmitter<IAsyncRetryConsumerEventMap> {
  /**
   * Events list
   */
  public static readonly events = EAsyncRetryConsumerEvents;
  /**
   * The number of seconds to wait for each retry attempt (the first retry being the zero-th number in this array)
   **/
  public readonly retryDelaysSeconds: number[];
  /**
   * Topic names that are used in retry consumer
   */
  public readonly topics: ITopics;

  private readonly producer: Pick<Producer, 'send'>;
  private readonly maxRetries: number;
  private readonly maxWaitTime: number;

  private pausedTopicPartitions: Set<TTopicPartition> = new Set();

  /**
   * Create a new AsyncRetryConsumer instance
   */
  constructor({
    maxRetries = 5,
    retryDelaysSeconds = [30, 150, 750, 3750, 18750],
    maxWaitTime = 5000,
    producer,
    topic,
    groupId,
    topicNameStrategy = TopicNameStrategy.byRetry,
  }: IAsyncRetryConsumerOptions) {
    super();

    if (maxRetries <= 0) {
      throw new AsyncRetryConsumerError({
        message: `"maxRetries" must be > 0`,
        code: EAsyncRetryConsumerErrorCode.INVALID_CONFIGURATION,
      });
    }
    if (retryDelaysSeconds.length > maxRetries) {
      throw new AsyncRetryConsumerError({
        message: `retryDelays (${retryDelaysSeconds.toString()}) doesn't need to be longer than maxRetries (${maxRetries})`,
        code: EAsyncRetryConsumerErrorCode.INVALID_CONFIGURATION,
      });
    }
    if (!topic && !groupId) {
      throw new AsyncRetryConsumerError({
        message: `At least one of \`topic\` or \`groupId\` should be configured`,
        code: EAsyncRetryConsumerErrorCode.INVALID_CONFIGURATION,
      });
    }

    this.producer = producer;
    this.maxRetries = maxRetries;
    this.maxWaitTime = maxWaitTime;

    // here, we expand the provided array to cover up to the max retries, as specified (the final retry time is used for any extra retries)
    this.retryDelaysSeconds = [...Array(maxRetries).keys()].map((i) => {
      return (retryDelaysSeconds[i] ||
        retryDelaysSeconds[retryDelaysSeconds.length - 1]) as number;
    });

    const topicNameGenerator = topicNameStrategy({ topic, groupId });

    this.topics = {
      original: [topic],
      retries: this.retryDelaysSeconds.map((delay, attempt) => {
        return topicNameGenerator({ delay, attempt });
      }),
      dlq: [topicNameGenerator({ isDlq: true })],
    };
  }

  /**
   * Wraps the provided handler with a handler that will send the message to the appropriate retry (or dead-letter) topic if an exception is thrown
   * @param handler - your message handler that will be provided with a few extra parameters relevant to the async retry process
   * @returns - a standard message handler that can be passed to a KafkaJS consumer instance
   */
  public eachMessage(
    handler: TAsyncRetryConsumerMessageHandler,
  ): EachMessageHandler {
    return async (payload) => {
      const { isReady, ...details } = this.asyncRetryMessageDetails(
        payload.message.headers || {},
        payload.topic,
      );
      if (!isReady) {
        await this.pauseUntilMessageIsReady(
          payload.topic,
          payload.partition,
          details.processTime,
          payload.pause.bind(this),
        );
      }
      try {
        return await handler({ ...payload, ...details });
      } catch (error: unknown) {
        await this.handleMessageFailure({
          error: error instanceof Error ? error : new Error(String(error)),
          message: payload.message,
          details,
        });
      }
    };
  }

  /**
   * Wraps the provided handler with a handler that will provide some extra callback functions for dealing with message processing errors and retries.
   * 🚨 **Important** 🚨
   * Like the KafkaJS docs mention, using `eachBatch` directly is considered a "more advanced use case" and it is recommended that you use the `eachMessage` approach unless there is a specific reason that mode of processing is not workable.
   * While the implementation inside this module is a lot more complex for the `eachBatch` processing model than `eachMessage`, the primary difference exposed to the consumer of this functionality is that instead of simply allowing exceptions to bubble up to the `eachMessage` wrapper function, the `messageFailureHandler` callback function must be used.
   * Also, when processing retries of a message using `eachBatch`, some of the batch metadata provided to the `eachBatch` handler function will almost certainly be incorrect since the batch of messages from a retry topic may be split since some messages may not ready to be retried quite yet.
   * When that happens, no attempt is made to keep the various attributes of the `batch` object (i.e. `offsetLag()`, `offsetLagLow()`, `firstOffset()` and `lastOffset()`), in sync with the actual batch of messages that are being passed to your `eachBatch` handler.
   * @param handler - your batch handler that will be provided with a few extra parameters relevant to the async retry process
   * @returns - a standard batch handler that can be passed to a KafkaJS consumer instance
   */
  public eachBatch(handler: TAsyncRetryConsumerBatchHandler): EachBatchHandler {
    return async (payload) => {
      // callbacks related to async retries
      const asyncRetryMessageDetails = (message: KafkaMessage) =>
        this.asyncRetryMessageDetails(message.headers, payload.batch.topic);
      const messageFailureHandler = (error: Error, message: KafkaMessage) =>
        this.handleMessageFailure({
          error,
          message,
          details: this.asyncRetryMessageDetails(
            message.headers || {},
            payload.batch.topic,
          ),
        });

      if (this.topics.retries.includes(payload.batch.topic)) {
        // we need to only provide messages that are ready to be processed to the message handler
        const allMessages = [...payload.batch.messages];

        // we do a while loop here in case any subsequent batches of messages become "ready" while the prior set is being processed
        while (allMessages.length > 0) {
          const readyMessages = this.extractReadyMessages(
            payload.batch.topic,
            allMessages,
          );
          if (!readyMessages) {
            const details = this.asyncRetryMessageDetails(
              allMessages[0]?.headers,
              payload.batch.topic,
            );
            await this.pauseUntilMessageIsReady(
              payload.batch.topic,
              payload.batch.partition,
              details.processTime,
              payload.pause.bind(this),
            );
            continue;
          }
          await handler({
            ...payload,
            batch: { ...payload.batch, messages: readyMessages },
            asyncRetryMessageDetails,
            messageFailureHandler,
          });
        }
        return;
      }

      // here's processing for the normal (non-retried) messages
      await handler({
        ...payload,
        asyncRetryMessageDetails,
        messageFailureHandler,
      });
    };
  }

  private extractReadyMessages(
    topic: string,
    messages: KafkaMessage[],
  ): KafkaMessage[] | undefined {
    // we want to grab a contiguous series of "ready" messages and leave the rest as-is
    const firstNotReady = messages.findIndex(
      (m) => !this.asyncRetryMessageDetails(m.headers, topic).isReady,
    );
    const readyMessages = messages.splice(
      0,
      firstNotReady === -1 ? messages.length : firstNotReady,
    );
    return readyMessages.length > 0 ? readyMessages : undefined;
  }

  private pauseUntilMessageIsReady(
    topic: string,
    partition: number,
    processTime: Date,
    pause: () => () => void,
  ): Promise<void> {
    const waitTime = processTime.getTime() - Date.now();
    if (waitTime < this.maxWaitTime) {
      return new Promise((resolve) => setTimeout(resolve, waitTime).unref());
    }
    const topicPartition: TTopicPartition = `${topic}:${partition}`;

    const alreadyPaused = this.pausedTopicPartitions.has(topicPartition);

    if (!alreadyPaused) {
      const resume = pause();
      this.pausedTopicPartitions.add(topicPartition);
      setTimeout(() => {
        resume();
        this.pausedTopicPartitions.delete(topicPartition);
      }, waitTime).unref();
    }

    // this returns control to KafkaJS while we wait for the scheduled timeout to fire
    throw new PauseProcessing(waitTime, topic, partition);
  }

  private asyncRetryMessageDetails(
    headers: KafkaMessage['headers'],
    topic: string,
  ): IAsyncRetryConsumerMessageDetails {
    const arHeaders = new AsyncRetryConsumerHeaders(headers);
    if (arHeaders.isValid) {
      return {
        isRetry: true,
        previousAttempts: arHeaders.att,
        originalTopic: arHeaders.top,
        processTime: new Date(arHeaders.ttl),
        isReady: arHeaders.ttl <= Date.now(),
      };
    }
    return {
      isRetry: false,
      previousAttempts: 0,
      originalTopic: topic,
      processTime: new Date(),
      isReady: true,
    };
  }

  private prepareAsyncRetryHeaders(
    details: Pick<
      IAsyncRetryConsumerMessageDetails,
      'previousAttempts' | 'originalTopic'
    >,
  ): IHeaders {
    const ttl =
      Date.now() + this.retryDelaysSeconds[details.previousAttempts]! * 1000;
    const headers: IAsyncRetryConsumerMessageHeaders = {
      ttl,
      top: details.originalTopic,
      att: details.previousAttempts + 1,
    };
    return { asyncRetry: Buffer.from(JSON.stringify(headers)) };
  }

  private async handleMessageFailure({
    message,
    details,
    error,
  }: Omit<IEventPayload, 'topic'>) {
    const shouldDeadLetter =
      error instanceof DeadLetter ||
      details.previousAttempts >= this.maxRetries;
    let nextTopic: string | undefined;
    let headers = {};
    if (shouldDeadLetter) {
      nextTopic = this.topics.dlq[0];
    } else {
      nextTopic = this.topics.retries[details.previousAttempts]!;
      headers = this.prepareAsyncRetryHeaders(details);
    }
    await this.producer.send({
      topic: nextTopic,
      messages: [
        {
          key: message.key,
          value: message.value,
          headers: {
            ...(message.headers || {}),
            ...headers,
          },
        },
      ],
    });

    this.emit(
      shouldDeadLetter
        ? AsyncRetryConsumer.events.DEAD_LETTER
        : AsyncRetryConsumer.events.RETRY,
      { message, details, error, topic: nextTopic },
    );
  }

  public override on(
    event: EAsyncRetryConsumerEvents.DEAD_LETTER,
    listener: (data: IEventPayload) => void,
  ): this;
  public override on(
    event: EAsyncRetryConsumerEvents.RETRY,
    listener: (data: IEventPayload) => void,
  ): this;
  public override on(
    event: EAsyncRetryConsumerEvents,
    listener: (data: IEventPayload) => void,
  ): this {
    return super.on(event, listener);
  }
}
