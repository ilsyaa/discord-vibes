import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const API_KEY_GEMINI = process.env.API_KEY_GEMINI;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

export { API_KEY_GEMINI, DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID }
