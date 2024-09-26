import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } from '@discordjs/voice';
import { SlashCommandBuilder }  from 'discord.js';
import ytdl from '@distube/ytdl-core';

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

        if (!ytdl.validateURL(query)) {
            return interaction.reply('pake link youtube bang');
        }

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

            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const agent = ytdl.createProxyAgent({ uri: 'http://103.152.112.162:80' })

            const stream = ytdl(query, { 
                filter: 'audioonly',
                agent
            });

            stream.on('error', (error) => {
                console.error('stream YouTube:', error);
                if (connection) {
                    connection.destroy();
                }
            });

            connection.subscribe(player);   

            const resource = createAudioResource(stream);
            player.play(resource);

            await interaction.editReply(`Mulai memutar: lagu`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Waduh ada masalah le');
        }
    }
}