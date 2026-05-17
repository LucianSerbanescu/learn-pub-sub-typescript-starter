import amqp from "amqplib";
import { publishJSON, SimpleQueueType } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect } from "../internal/routing/routing.js";
import { PauseKey } from "../internal/routing/routing.js";
import { PlayingState } from "../internal/gamelogic/gamestate.js";
import { clientWelcome } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind } from "../internal/pubsub/publish.js"

async function main() {
  console.log("Starting Peril client...");
  const connection = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(connection);
  console.log("Connected to RabbitMQ");

  const username = await clientWelcome();

  await declareAndBind(
    conn,
    ExchangePerilDirect,
    `pause.${username}`,
    PauseKey,
    SimpleQueueType.Transient,
  );

  process.on("SIGINT", async () => {
    console.log("Got SIGINT signal.");
    // process.kill(process.pid, "SIGINT");
    await conn.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
