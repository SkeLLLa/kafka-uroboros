<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [IAsyncRetryConsumerEachMessagePayload](./kafka-uroboros.iasyncretryconsumereachmessagepayload.md) &gt; [processTime](./kafka-uroboros.iasyncretryconsumereachmessagepayload.processtime.md)

## IAsyncRetryConsumerEachMessagePayload.processTime property

The earliest time (expressed as a object) this message should be processed. For the first attempt, this will always be "now". For subsequent attempts, this will always be something &lt;<!-- -->= "now" (potentially in the past if the consumer is behind where it should be)

**Signature:**

```typescript
processTime: Date;
```
