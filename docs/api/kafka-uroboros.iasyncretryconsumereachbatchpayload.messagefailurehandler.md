<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [IAsyncRetryConsumerEachBatchPayload](./kafka-uroboros.iasyncretryconsumereachbatchpayload.md) &gt; [messageFailureHandler](./kafka-uroboros.iasyncretryconsumereachbatchpayload.messagefailurehandler.md)

## IAsyncRetryConsumerEachBatchPayload.messageFailureHandler property

Handles sending a message to the appropriate retry or dead-letter topic based on how many retries have already been attempted as well as the object passed in

**Signature:**

```typescript
messageFailureHandler: (error: Error, message: KafkaMessage) => Promise<void>;
```
