const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: "ping",
    description: "Check bot's server latency in ms",
    args: [],
    async execute(ctx, client) {
        let EMBED_COLOR = client.EMBED_COLOR();
        const embed = new EmbedBuilder()
            .setAuthor({name: "🏓 Pong!", iconURL: client.assetsURL_icons+"/ping.png?color="+EMBED_COLOR.replace("#", "")})
            .setColor(EMBED_COLOR)
            .setDescription(`${client.ws.ping}ms`);

        return ctx.reply({embeds: [embed]});
    }
}