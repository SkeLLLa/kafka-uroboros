import type {
  IRetryTopicNameGeneratorOptions,
  TRetryTopicNameGenerator,
} from '../../types/TopicNameGenerator';

export const topicNameGeneratorRetry: TRetryTopicNameGenerator = ({
  topic,
  attempt,
}: IRetryTopicNameGeneratorOptions): string => {
  return `${topic}-retry-${attempt + 1}`;
};
