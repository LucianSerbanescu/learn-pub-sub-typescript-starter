import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publish.js"
import { ExchangePerilDirect } from "../internal/routing/routing.js"
import { PauseKey } from "../internal/routing/routing.js";
import { PlayingState } from "../internal/gamelogic/gamestate.js";

async function main() {
  console.log("Starting Peril server...");
  const connection = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(connection);
  const confirmChannel = await conn.createConfirmChannel();
  console.log("Connected to RabbitMQ");

  console.log("publish message");

  const playingState: PlayingState = {
    isPaused: true,
  }

  await publishJSON(
    confirmChannel,
    ExchangePerilDirect,
    PauseKey,
    playingState
  )

  process.on("SIGINT", async () => {
    console.log("Got SIGINT signal.");
    // process.kill(process.pid, "SIGINT");
    await conn.close()
    process.exit(0)
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
