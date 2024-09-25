import { ActivityType, Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } from '@discordjs/voice';
import play from 'play-dl';
import { DISCORD_BOT_TOKEN, CLIENT_ID } from './config.js';

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

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

// Definisi perintah slash
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Memutar lagu dari YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('URL YouTube atau judul lagu')
        .setRequired(true)),
];

// Fungsi untuk mendaftarkan perintah slash
async function registerCommands() {
  try {
    console.log('Mulai mendaftarkan perintah aplikasi (/).');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
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

  if (commandName === 'play') {
    if (!interaction.member.voice.channel) {
      return interaction.reply('Anda harus berada di voice channel untuk memutar musik!');
    }

    const query = interaction.options.getString('query');

    await interaction.deferReply();

    try {
      const ytInfo = await play.search(query, { limit: 1 });
      if (!ytInfo || ytInfo.length === 0) {
        return interaction.editReply('Tidak dapat menemukan lagu tersebut.');
      }

      const stream = await play.stream(ytInfo[0].url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });

      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      player.play(resource);
      connection.subscribe(player);

      await interaction.editReply(`Mulai memutar: ${ytInfo[0].title}`);

    } catch (error) {
      console.error(error);
      await interaction.editReply('Terjadi kesalahan saat mencoba memutar musik.');
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content) return;
  // Tambahkan logika tambahan di sini jika diperlukan
});

client.login(DISCORD_BOT_TOKEN);