import { KafkaJSNonRetriableError } from 'kafkajs';

/**
 * We are extending KafkaJSError here to avoid noisy logging that KafkaJS does for non-KafkaJS errors
 * @internal
 **/
export class PauseProcessing extends KafkaJSNonRetriableError {
  constructor(
    public readonly waitMs: number,
    public readonly topic: string,
    public readonly partition: number,
  ) {
    super(
      `Waiting ${waitMs}ms before resuming processing messages from ${topic}/${partition}`,
    );
    Error.captureStackTrace(this);
    Object.setPrototypeOf(this, PauseProcessing.prototype);
  }
}
