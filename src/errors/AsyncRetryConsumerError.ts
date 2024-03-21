export enum EAsyncRetryConsumerErrorCode {
  UNKNOWN,
  INVALID_CONFIGURATION,
}

export interface IAsyncRetryConsumerErrorOptions {
  message: string;
  code: EAsyncRetryConsumerErrorCode;
}

/**
 * A custom error clas that AsyncRetryConsumer may throw
 * @public
 */
export class AsyncRetryConsumerError extends Error {
  public readonly code: EAsyncRetryConsumerErrorCode;
  constructor({ message, code }: IAsyncRetryConsumerErrorOptions) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AsyncRetryConsumerError.prototype);
    Error.captureStackTrace(this);
  }
}
