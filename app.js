import 'dotenv/config';
import { loadCommands } from './src/lib/loadCommands.js';

(async () => {
  await loadCommands();
  await import("./src/app/discord.js");
})()