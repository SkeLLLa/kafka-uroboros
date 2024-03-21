import type {
  EachBatchPayload,
  EachMessagePayload,
  KafkaMessage,
} from 'kafkajs';

export interface IAsyncRetryConsumerMessageDetails {
  /** Whether this message has been routed through an async retry or not */
  isRetry: boolean;
  /** Whether this message is ready to be processed or not */
  isReady: boolean;
  /** The original topic the message came from */
  originalTopic: string;
  /** The number of attempts the message has had so far */
  previousAttempts: number;
  /** The earliest time the message should be processed */
  processTime: Date;
}

export interface IAsyncRetryConsumerMessageHeaders {
  /**
   * The original topic (before any async retries) the message came from
   **/
  top: string;
  /**
   * The earliest time (expressed as milliseconds since epoch) when the message is expected to be retried
   **/
  ttl: number;
  /**
   * The number of times this message has already been attempted
   **/
  att: number;
}

/**
 * The full set of data provided to the {@link TAsyncRetryConsumerMessageHandler} when processing a message (including details specific to async retry handling)
 */
export interface IAsyncRetryConsumerEachMessagePayload
  extends EachMessagePayload {
  /**
   * Whether this message attempt is a retry or not (will be false on the first attempt and true on all subsequent attempts)
   */
  isRetry: boolean;
  /**
   * What topic the message was originally published to before any retries
   */
  originalTopic: string;
  /**
   * How many attempts this message has had so far (will be 0 on the first attempt and 1 on the second attempt, etc.)
   */
  previousAttempts: number;
  /**
   * The earliest time (expressed as a {@link Date} object) this message should be processed. For the first attempt, this will always be "now". For subsequent attempts, this will always be something \<= "now" (potentially in the past if the consumer is behind where it should be)
   */
  processTime: Date;
}

export type TAsyncRetryConsumerMessageHandler = (
  payload: IAsyncRetryConsumerEachMessagePayload,
) => Promise<void>;

export interface IAsyncRetryConsumerEachBatchPayload extends EachBatchPayload {
  /**
   * Given a {@link KafkaMessage} object, returns details relevant to async retry handling
   */
  asyncRetryMessageDetails: (
    message: KafkaMessage,
  ) => IAsyncRetryConsumerMessageDetails;
  /**
   * Handles sending a message to the appropriate retry or dead-letter topic based on how many retries have already been attempted as well as the {@link Error} object passed in
   */
  messageFailureHandler: (error: Error, message: KafkaMessage) => Promise<void>;
}

export type TAsyncRetryConsumerBatchHandler = (
  payload: IAsyncRetryConsumerEachBatchPayload,
) => Promise<void>;
