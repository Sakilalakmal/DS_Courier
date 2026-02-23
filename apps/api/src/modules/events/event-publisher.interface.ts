export const EVENT_PUBLISHER = Symbol("EVENT_PUBLISHER");

export type PublishMessage = {
  topic: string;
  key: string;
  value: unknown;
};

export interface EventPublisher {
  publish(message: PublishMessage): Promise<void>;
}
