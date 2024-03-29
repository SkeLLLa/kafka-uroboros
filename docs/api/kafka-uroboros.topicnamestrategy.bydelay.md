<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [TopicNameStrategy](./kafka-uroboros.topicnamestrategy.md) &gt; [byDelay](./kafka-uroboros.topicnamestrategy.bydelay.md)

## TopicNameStrategy.byDelay property

Name topics by seconds the retry is delayed.

**Signature:**

```typescript
static readonly byDelay: TTopicNameStrategyFactory;
```

## Remarks

\* Each topic in consumer group will have individual retry topics, therefore retries could be consumed concurrently. \* If consumer group id `groupId` is not provided, retries may be consumed by other consumer groups.

## Example

If `topic` and `groupId` supplied:

```ts
{ topic: 'foo', groupId: 'bar' }
```

\* Retry topics will be the following: `bar-foo-delay-10`<!-- -->, `bar-foo-delay-30`<!-- -->, ... , `bar-foo-delay-N`<!-- -->. \* Dead letter topic will be `foo-dlq`<!-- -->.

If only `topic` supplied:

```ts
{
  topic: 'foo';
}
```

\* Retry topics will be the following: `foo-delay-1`<!-- -->, `foo-delay-2`<!-- -->, ... , `foo-delay-N`<!-- -->. \* Dead letter topic will be `foo-dlq`<!-- -->.
