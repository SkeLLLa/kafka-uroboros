<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [IAsyncRetryConsumerOptions](./kafka-uroboros.iasyncretryconsumeroptions.md)

## IAsyncRetryConsumerOptions interface

Async retry consumer options

**Signature:**

```typescript
export interface IAsyncRetryConsumerOptions
```

## Properties

<table><thead><tr><th>

Property

</th><th>

Modifiers

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[groupId?](./kafka-uroboros.iasyncretryconsumeroptions.groupid.md)

</td><td>

</td><td>

string \| undefined

</td><td>

_(Optional)_ The consumer group id.

</td></tr>
<tr><td>

[maxRetries?](./kafka-uroboros.iasyncretryconsumeroptions.maxretries.md)

</td><td>

</td><td>

number

</td><td>

_(Optional)_ The maximum number of retries for a given message

</td></tr>
<tr><td>

[maxWaitTime?](./kafka-uroboros.iasyncretryconsumeroptions.maxwaittime.md)

</td><td>

</td><td>

number

</td><td>

_(Optional)_ The amount of time (in milliseconds) to block an `eachMessage` call while waiting until a retry message is ready to be processed. Waits above this amount will result in the consumer pausing on the topic/partition until the message is ready.

</td></tr>
<tr><td>

[producer](./kafka-uroboros.iasyncretryconsumeroptions.producer.md)

</td><td>

</td><td>

Pick&lt;Producer, 'send'&gt;

</td><td>

A previously configured (and connected) producer that can be used to publish messages into the appropriate delay and retry topics

</td></tr>
<tr><td>

[retryDelaysSeconds?](./kafka-uroboros.iasyncretryconsumeroptions.retrydelaysseconds.md)

</td><td>

</td><td>

number\[\]

</td><td>

_(Optional)_ A series of delays (in seconds) that will be used for each corresponding retry attempt

</td></tr>
<tr><td>

[topic](./kafka-uroboros.iasyncretryconsumeroptions.topic.md)

</td><td>

</td><td>

string

</td><td>

The consumer topic that this async retry consumer is handling messages for.

</td></tr>
<tr><td>

[topicNameStrategy](./kafka-uroboros.iasyncretryconsumeroptions.topicnamestrategy.md)

</td><td>

</td><td>

[TTopicNameStrategyFactory](./kafka-uroboros.ttopicnamestrategyfactory.md)

</td><td>

Retry topic name strategy

</td></tr>
</tbody></table>
