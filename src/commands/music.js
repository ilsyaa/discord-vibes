import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';
import { SlashCommandBuilder }  from 'discord.js';

export default {
    name: 'music',
    registerCommand: [
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('Memutar lagu dari YouTube')
            .addStringOption(option =>
                option.setName('query').setDescription('URL YouTube atau judul lagu').setRequired(true)),
    ],
    run: async ({ client, interaction }) => {
        const permissions = interaction.member.voice.channel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.reply('Bot tidak memiliki izin untuk bergabung atau berbicara di voice channel.');
        }

        if (!interaction.member.voice.channel) {
            return interaction.reply('Minimal join voice le!');
        }

        const query = interaction.options.getString('query');

        await interaction.deferReply();

        try {
            const player = createAudioPlayer({});
            player.on(AudioPlayerStatus.Buffering, () => {
                console.log('Audio player sedang buffering');
            });
            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Audio player dalam keadaan idle');
            });
            player.on(AudioPlayerStatus.AutoPaused, () => {
                console.log('Audio player auto-paused');
            });
            player.on(AudioPlayerStatus.Playing, () => {
                console.log('Audio player sedang diputar');
            });
            player.on(AudioPlayerStatus.Paused, () => {
                console.log('Audio player sedang berhenti');
            });

            const ytInfo = await play.search(query, { limit: 1 });
            if (!ytInfo || ytInfo.length === 0) {
                return interaction.editReply('Musik gak terkenal le, cari lain aja gak ada gw cari.');
            }

            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            connection.subscribe(player);

            const stream = await play.stream(ytInfo[0].url);
            // const resource = createAudioResource('./cat.mp3')
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });
            player.play(resource);

            await interaction.editReply(`Mulai memutar: ${ytInfo[0]?.title || 'lagu'}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Waduh ada masalah le');
        }
    }
}