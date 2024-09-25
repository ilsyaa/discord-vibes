import { ActivityType, Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { commands as getCommands } from '../lib/loadCommands.js';

const client = new Client({
  presence: {
    status: 'online',
    afk: false,
    activities: [{
      name: 'Artificial Intelligence ⚡',
      type: ActivityType.Custom
    }],
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
const commands = Array.from(getCommands.values()).flatMap(command => command.registerCommand);

async function registerCommands() {
  try {
    console.log('Mulai mendaftarkan perintah aplikasi (/).');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('Berhasil mendaftarkan perintah aplikasi (/).');
  } catch (error) {
    console.error(error);
  }
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  registerCommands();
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  const command = Array.from(getCommands.values()).find((v) => {
    if (v.registerCommand[0].name.toLowerCase() == commandName) {
      return true
    }
  });
  if(!command) return
  await command.run({client, interaction})
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content) return;
  // Tambahkan logika tambahan di sini jika diperlukan
});

client.login(process.env.DISCORD_BOT_TOKEN);