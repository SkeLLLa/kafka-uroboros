import type { KafkaMessage } from 'kafkajs';
import { IAsyncRetryConsumerMessageHeaders } from './types/AsyncRetryConsumerMessage';

/**
 * Async retry consumer headers.
 * Parses and validates message headers.
 * @public
 */
export class AsyncRetryConsumerHeaders
  implements IAsyncRetryConsumerMessageHeaders
{
  public readonly isValid: boolean;
  public readonly att: number = 0;
  public readonly top: string = '';
  public readonly ttl: number = 0;
  constructor(headers: KafkaMessage['headers']) {
    this.isValid = false;
    if (!headers || !('asyncRetry' in headers) || !headers['asyncRetry']) {
      return;
    }
    const raw = String(headers['asyncRetry']);
    try {
      const retryHeaders = JSON.parse(raw) as unknown;
      this.isValid = this.validate(retryHeaders);
      if (this.validate(retryHeaders)) {
        this.isValid = true;
        this.att = retryHeaders.att;
        this.top = retryHeaders.top;
        this.ttl = retryHeaders.ttl;
      }
    } catch (err: unknown) {
      return;
    }
  }

  private validate(data: unknown): data is IAsyncRetryConsumerMessageHeaders {
    const value = data as IAsyncRetryConsumerMessageHeaders;
    return (
      !!value &&
      typeof value === 'object' &&
      typeof value.top === 'string' &&
      typeof value.ttl === 'number' &&
      typeof value.att === 'number'
    );
  }
}
