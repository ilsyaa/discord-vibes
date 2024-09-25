import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

export { DISCORD_BOT_TOKEN, CLIENT_ID }
