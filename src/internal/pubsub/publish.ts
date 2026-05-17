import type { ConfirmChannel } from "amqplib";
import amqp, { connect } from "amqplib";

export function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T,
): Promise<void> {
  const json_value = JSON.stringify(value);
  const bufferd = Buffer.from(json_value);

  return new Promise((resolve, reject) => {
    ch.publish(
      exchange,
      routingKey,
      bufferd,
      { contentType: "application/json" },
      (err) => {
        if (err !== null) {
          reject(/* some error */);
        } else {
          resolve();
        }
      },
    );
  });
}

export enum SimpleQueueType {
  Durable,
  Transient,
}

export async function declareAndBind(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType,
): Promise<[Channel, amqp.Replies.AssertQueue]> {
  const chann = await conn.createChannel();
  const options = {
      durable: queueType === SimpleQueueType.Durable, 
      autoDelete: queueType === SimpleQueueType.Transient,
      exclusive: queueType === SimpleQueueType.Transient,
  };
  const queue = await chann.assertQueue(
    queueName,
    options
  );
  const binding = await chann.bindQueue(queueName, exchange, key);
  return [chann, queue];
}
