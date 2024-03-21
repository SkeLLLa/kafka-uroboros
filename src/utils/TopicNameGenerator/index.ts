import { topicNameGeneratorDeadLetterQueue } from './dead-letter';
import { topicNameGeneratorDelay } from './delay';
import { topicNameGeneratorRetry } from './retry';

export class TopicNameGenerator {
  static dlq = topicNameGeneratorDeadLetterQueue;
  static retry = topicNameGeneratorRetry;
  static delay = topicNameGeneratorDelay;
}
