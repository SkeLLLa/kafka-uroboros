import type { IAsyncRetryConsumerOptions } from '../AsyncRetryConsumer';
import {
  AsyncRetryConsumerError,
  EAsyncRetryConsumerErrorCode,
} from '../errors/AsyncRetryConsumerError';

/**
 * Topic name strategy options
 * @public
 */
export interface ITopicNameStrategyOptions {
  /**
   * Retry attempt.
   *
   * @remarks
   * Used in retry-based naming strategy
   */
  attempt?: number;
  /**
   * Retry delay
   *
   * @remarks
   * Used in delay-based naming strategy
   */
  delay?: number;
  /**
   * Is dead letter
   *
   * @remarks
   * Used for dead letter queue topic name
   */
  isDlq?: boolean;
}

export type TTopicNameFn = (options: ITopicNameStrategyOptions) => string;
export type TTopicNameStrategyFactory = (
  options: Pick<IAsyncRetryConsumerOptions, 'topic' | 'groupId'>,
) => TTopicNameFn;

/**
 * Retry topic name strategy options.
 * @public
 */
export class TopicNameStrategy {
  /**
   * Name topics by retry attempt.
   *
   * @remarks
   * * Each topic in consumer group will have individual retry topics, therefore retries could be consumed concurrently.
   * * If consumer group id `groupId` is not provided, retries may be consumed by other consumer groups.
   *
   * @example
   * If `topic` and `groupId` supplied:
   * ```ts
   * { topic: 'foo', groupId: 'bar' }
   * ```
   * * Retry topics will be the following: `bar-foo-retry-1`, `bar-foo-retry-2`, ... , `bar-foo-retry-N`.
   * * Dead letter topic will be `foo-dlq`.
   *
   * If only `topic` supplied:
   * ```ts
   * { topic: 'foo' }
   * ```
   * * Retry topics will be the following: `foo-retry-1`, `foo-retry-2`, ... , `foo-retry-N`.
   * * Dead letter topic will be `foo-dlq`.
   * @param options - Topic and group configuration
   * @returns Function to get topic name
   */
  static readonly byRetry: TTopicNameStrategyFactory = (options) => {
    const prefix = options.groupId
      ? `${options.groupId}-${options.topic}`
      : options.topic;
    return ({ attempt, isDlq }) => {
      return isDlq ? `${prefix}-dlq` : `${prefix}-retry-${attempt}`;
    };
  };

  /**
   * Name topics by seconds the retry is delayed.
   *
   * @remarks
   * * Each topic in consumer group will have individual retry topics, therefore retries could be consumed concurrently.
   * * If consumer group id `groupId` is not provided, retries may be consumed by other consumer groups.
   *
   * @example
   * If `topic` and `groupId` supplied:
   * ```ts
   * { topic: 'foo', groupId: 'bar' }
   * ```
   * * Retry topics will be the following: `bar-foo-delay-10`, `bar-foo-delay-30`, ... , `bar-foo-delay-N`.
   * * Dead letter topic will be `foo-dlq`.
   *
   * If only `topic` supplied:
   * ```ts
   * { topic: 'foo' }
   * ```
   * * Retry topics will be the following: `foo-delay-1`, `foo-delay-2`, ... , `foo-delay-N`.
   * * Dead letter topic will be `foo-dlq`.
   * @param options - Topic and group configuration
   * @returns Function to get topic name
   */
  static readonly byDelay: TTopicNameStrategyFactory = (options) => {
    const prefix = options.groupId
      ? `${options.groupId}-${options.topic}`
      : options.topic;
    return ({ delay, isDlq }) => {
      return isDlq ? `${prefix}-dlq` : `${prefix}-delay-${delay}`;
    };
  };

  /**
   * Name topics by retry attempt.
   *
   * @remarks
   * All topics in consumer group will have shared retry topics.
   *
   * @example
   * If `topic` and `groupId` supplied:
   * ```ts
   * { topic: 'foo', groupId: 'bar' }
   * ```
   * * Retry topics will be the following: `bar-foo-retry-1`, `bar-foo-retry-2`, ... , `bar-foo-retry-N`.
   * * Dead letter topic will be `foo-dlq`.
   *
   * If only `topic` supplied:
   * ```ts
   * { topic: 'foo' }
   * ```
   * * Retry topics will be the following: `foo-retry-1`, `foo-retry-2`, ... , `foo-retry-N`.
   * * Dead letter topic will be `foo-dlq`.
   * @param options - Topic and group configuration
   * @returns Function to get topic name
   */
  static readonly byRetryGroup: TTopicNameStrategyFactory = (options) => {
    if (!options.groupId) {
      throw new AsyncRetryConsumerError({
        message: `To use group strategy \`groupId\` should be specified.`,
        code: EAsyncRetryConsumerErrorCode.INVALID_CONFIGURATION,
      });
    }
    const prefix = options.groupId;
    return ({ attempt, isDlq }) => {
      return isDlq ? `${prefix}-dlq` : `${prefix}-retry-${attempt}`;
    };
  };

  /**
   * Name topics by seconds the retry is delayed.
   *
   * @remarks
   * All topics in consumer group will have shared retry topics.
   *
   * @example
   * If `topic` and `groupId` supplied:
   * ```ts
   * { topic: 'foo', groupId: 'bar' }
   * ```
   * * Retry topics will be the following: `bar-foo-delay-10`, `bar-foo-delay-30`, ... , `bar-foo-delay-N`.
   * * Dead letter topic will be `foo-dlq`.
   *
   * If only `topic` supplied:
   * ```ts
   * { topic: 'foo' }
   * ```
   * * Retry topics will be the following: `foo-delay-1`, `foo-delay-2`, ... , `foo-delay-N`.
   * * Dead letter topic will be `foo-dlq`.
   * @param options - Topic and group configuration
   * @returns Function to get topic name
   */
  static readonly byDelayGroup: TTopicNameStrategyFactory = (options) => {
    if (!options.groupId) {
      throw new AsyncRetryConsumerError({
        message: `To use group strategy \`groupId\` should be specified.`,
        code: EAsyncRetryConsumerErrorCode.INVALID_CONFIGURATION,
      });
    }
    const prefix = options.groupId;
    return ({ delay, isDlq }) => {
      return isDlq ? `${prefix}-dlq` : `${prefix}-delay-${delay}`;
    };
  };
}
