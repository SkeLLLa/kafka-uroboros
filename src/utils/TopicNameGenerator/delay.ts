import type {
  IRetryTopicNameGeneratorOptions,
  TRetryTopicNameGenerator,
} from '../../types/TopicNameGenerator';

export const topicNameGeneratorDelay: TRetryTopicNameGenerator = ({
  topic,
  delay,
}: IRetryTopicNameGeneratorOptions): string => {
  return `${topic}-delay-${delay}s`;
};
