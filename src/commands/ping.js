import { SlashCommandBuilder }  from 'discord.js';

export default {
    name: 'ping',
    registerCommand: [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping bot'),
    ],
    run: async ({ client, interaction }) => {
        return interaction.reply('Pong!');
    }
}