const { VALID_SERVERS } = new (require('../modules/guntherUtils'))();
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        // Check for invalid server
        if (VALID_SERVERS.length) {
            if (!(VALID_SERVERS.includes(message.guild.id))) {
                message.channel.send({embeds: [new EmbedBuilder().setColor(client.EMBED_COLOR())
                    .setDescription("😝 | Nice try, little one, but this bot was not made for your server. Better luck next time!")]});

                return client.guilds.cache.get(message.guild.id)
                .leave() // Leave
                //.then(g => client.logger.debug('GUILD', `Leaved ${message.guild.name}, as it is not in the valid servers array`)) // Give confirmation after leaving
                .catch(console.error);
            }
        }

        // Check for prefix commands
        if (message.content.startsWith("-")) {
            message.channel.send({embeds: [new EmbedBuilder().setColor(client.EMBED_COLOR())
                .setDescription("ℹ️ Prefix commands are not supported now, use slash (/) commands instead.")]});
        }
    }
};