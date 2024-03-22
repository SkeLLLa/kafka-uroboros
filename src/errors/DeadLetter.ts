/**
 * A custom exception that will result in the message being sent to the dead-letter topic.
 * To send a message directly to the dead letter topic and avoid any subsequent retries, provide a `DeadLetter` exception to the `messageFailureHandler` callback function.
 * @public
 */
export class DeadLetter extends Error {
  constructor(reason: string) {
    super(`Sending message to dead letter topic: ${reason}`);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DeadLetter.prototype);
    Error.captureStackTrace(this);
  }
}
