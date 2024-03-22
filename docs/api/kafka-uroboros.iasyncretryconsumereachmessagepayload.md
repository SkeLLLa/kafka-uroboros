<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [IAsyncRetryConsumerEachMessagePayload](./kafka-uroboros.iasyncretryconsumereachmessagepayload.md)

## IAsyncRetryConsumerEachMessagePayload interface

The full set of data provided to the [TAsyncRetryConsumerMessageHandler](./kafka-uroboros.tasyncretryconsumermessagehandler.md) when processing a message (including details specific to async retry handling)

**Signature:**

```typescript
export interface IAsyncRetryConsumerEachMessagePayload extends EachMessagePayload
```

**Extends:** EachMessagePayload

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

[isRetry](./kafka-uroboros.iasyncretryconsumereachmessagepayload.isretry.md)

</td><td>

</td><td>

boolean

</td><td>

Whether this message attempt is a retry or not (will be false on the first attempt and true on all subsequent attempts)

</td></tr>
<tr><td>

[originalTopic](./kafka-uroboros.iasyncretryconsumereachmessagepayload.originaltopic.md)

</td><td>

</td><td>

string

</td><td>

What topic the message was originally published to before any retries

</td></tr>
<tr><td>

[previousAttempts](./kafka-uroboros.iasyncretryconsumereachmessagepayload.previousattempts.md)

</td><td>

</td><td>

number

</td><td>

How many attempts this message has had so far (will be 0 on the first attempt and 1 on the second attempt, etc.)

</td></tr>
<tr><td>

[processTime](./kafka-uroboros.iasyncretryconsumereachmessagepayload.processtime.md)

</td><td>

</td><td>

Date

</td><td>

The earliest time (expressed as a object) this message should be processed. For the first attempt, this will always be "now". For subsequent attempts, this will always be something &lt;<!-- -->= "now" (potentially in the past if the consumer is behind where it should be)

</td></tr>
</tbody></table>