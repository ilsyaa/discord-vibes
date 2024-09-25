import { SlashCommandBuilder }  from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';

export default {
    name: 'cat',
    registerCommand: [
        new SlashCommandBuilder()
            .setName('cat')
            .setDescription('Test stream music'),
    ],
    run: async ({ client, interaction }) => {
        const permissions = interaction.member.voice.channel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.reply('Bot tidak memiliki izin untuk bergabung atau berbicara di voice channel.');
        }

        if (!interaction.member.voice.channel) {
            return interaction.reply('Minimal join voice le!');
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
            connection.subscribe(player);

            const resource = createAudioResource('./cat.mp3')
            player.play(resource);

            await interaction.editReply(`Mulai memutar.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Waduh ada masalah le');
        }
    }
}