import amqp from "amqplib";
import {
  clientWelcome,
  commandStatus,
  getInput,
  printClientHelp,
  printQuit,
} from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/consume.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { commandMove } from "../internal/gamelogic/move.js";

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

  const gameState = new GameState(username);

  while (true) {
    const words = await getInput();

    if (words.length === 0) continue;

    const command = words[0];
    if (command === "spawn") {
      console.log("Spawing smth");
      try {
        await commandSpawn(gameState, words);
      } catch (err) {
        console.error("Error publishing pause message:", err);
      }
    } else if (command === "resume") {
  }

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
