<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kafka-uroboros](./kafka-uroboros.md) &gt; [DeadLetter](./kafka-uroboros.deadletter.md)

## DeadLetter class

A custom exception that will result in the message being sent to the dead-letter topic. To send a message directly to the dead letter topic and avoid any subsequent retries, provide a `DeadLetter` exception to the `messageFailureHandler` callback function.

**Signature:**

```typescript
export declare class DeadLetter extends Error
```

**Extends:** Error

## Constructors

<table><thead><tr><th>

Constructor

</th><th>

Modifiers

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[(constructor)(reason)](./kafka-uroboros.deadletter._constructor_.md)

</td><td>

</td><td>

Constructs a new instance of the `DeadLetter` class

</td></tr>
</tbody></table>
