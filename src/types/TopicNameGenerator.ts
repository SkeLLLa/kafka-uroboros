export interface IDLQTopicNameGeneratorOptions {
  /**
   * Topic name
   */
  topic: string;
}

export interface IRetryTopicNameGeneratorOptions
  extends IDLQTopicNameGeneratorOptions {
  /**
   * Topic name
   */
  topic: string;
  /**
   * Current retry attempt
   */
  attempt: number;
  /**
   * Current retry delay
   */
  delay: number;
}

/**
 * Retry topic name generator function
 */
export type TRetryTopicNameGenerator = (
  options: IRetryTopicNameGeneratorOptions,
) => string;

/**
 * Dead letter queue topic name generator function
 */
export type TDLQTopicNameGenerator = (
  options: IDLQTopicNameGeneratorOptions,
) => string;
