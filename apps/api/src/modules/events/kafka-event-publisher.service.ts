import { Injectable } from "@nestjs/common";
import { KafkaService } from "@/common/kafka/kafka.service.js";
import { EventPublisher, PublishMessage } from "./event-publisher.interface.js";

@Injectable()
export class KafkaEventPublisher implements EventPublisher {
  constructor(private readonly kafkaService: KafkaService) {}

  async publish(message: PublishMessage) {
    const producer = await this.kafkaService.getProducer();
    await producer.send({
      topic: message.topic,
      messages: [
        {
          key: message.key,
          value: JSON.stringify(message.value),
        },
      ],
    });
  }
}
