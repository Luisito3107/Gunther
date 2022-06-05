const { VALID_SERVERS } = new (require('../modules/guntherUtils'))();
const { PREFIX } = new (require('../modules/laffeyUtils'))();
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        // Check for invalid server
        if (VALID_SERVERS.length) {
            if (!(VALID_SERVERS.includes(message.guild.id))) {
                let guildName = message.guild.name;
                message.channel.send({embeds: [new EmbedBuilder().setColor(client.EMBED_COLOR())
                    .setDescription("😝 | Nice try, little one, but this bot was not made for your server. Better luck next time!")]});

                return client.guilds.cache.get(message.guild.id)
                .leave() // Leave
                .then(g => client.logger.debug('GUILD', `Leaved ${guildName}, as it is not in the valid servers array`)) // Give confirmation after leaving
                .catch(console.error);
            }
        }

        // Check for nickname changes
        client.checkForNickname(message.guild.members.me, undefined, message);

        // Check for prefix commands
        if (message.content.startsWith(PREFIX)) {
            message.channel.send({embeds: [new EmbedBuilder().setColor(client.EMBED_COLOR())
                .setDescription("ℹ️ Prefix commands are not supported now, use slash (/) commands instead.")]});
        }
    }
};