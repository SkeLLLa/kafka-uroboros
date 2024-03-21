import type { KafkaMessage } from 'kafkajs';
import type { IAsyncRetryConsumerMessageDetails } from './AsyncRetryConsumerMessage';

export enum EAsyncRetryConsumerEvents {
  DEAD_LETTER = 'dl',
  RETRY = 'retry',
}

export interface IAsyncRetryConsumerEventMap {
  [EAsyncRetryConsumerEvents.DEAD_LETTER]: [IEventPayload];
  [EAsyncRetryConsumerEvents.RETRY]: [IEventPayload];
}

export interface IEventPayload {
  /** The message being retried or dead-letter'd */
  message: KafkaMessage;
  /** Information about the retry-state of the message */
  details: Omit<IAsyncRetryConsumerMessageDetails, 'isReady'>;
  /** The Error that is triggering the message to be retried or dead-letter'd */
  error: unknown;
  /** The destination topic for the current retry attempt or dead-letter topic name as applicable */
  topic: string;
}
