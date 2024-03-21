import type {
  IDLQTopicNameGeneratorOptions,
  TDLQTopicNameGenerator,
} from '../../types/TopicNameGenerator';

export const topicNameGeneratorDeadLetterQueue: TDLQTopicNameGenerator = ({
  topic,
}: IDLQTopicNameGeneratorOptions): string => {
  return `${topic}-retry-dlq`;
};
