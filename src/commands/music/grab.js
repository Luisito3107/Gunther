const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'grab',
    description: 'Sends the current song to your direct messages',
    aliases: ["save"],
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        let error = false;
        let EMBED_COLOR = client.EMBED_COLOR();
        await ctx.member.send({embeds: [
            new EmbedBuilder()
                .setAuthor({name: `Song saved`, iconURL: client.assetsURL_icons+"/track.png?color="+EMBED_COLOR.replace("#", "")})
                .setThumbnail(player.queue.current.thumbnail ? player.queue.current.thumbnail : null)
                .setURL(player.queue.current.uri)
                .setColor(EMBED_COLOR)
                .setTimestamp()
                .setTitle(`${player.queue.current.title}`)
                .setFields([
                    {name: `⌛ Duration:`, value: (player.queue.current.isStream ? "🔴 LIVE" : `\`${client.formatDuration(player.queue.current.duration)}\``), inline: true},
                    {name: `🎵 Artist(s): `, value: `\`${player.queue.current.author}\``, inline: true},
                    {name: `▶ Play command:`, value: `\`/play song query: ${player.queue.current.uri}\``, inline: false},
                    {name: `🔎 Saved from:`, value: `<#${ctx.channelId}>`+"\n\u200B", inline: false}
                ])
                .setFooter({text: `Requested by ${player.queue.current.requester.tag}`, iconURL: player.queue.current.requester.displayAvatarURL({dynamic: true})})
        ]}).catch((e) => {
            error = true;
            return ctx.reply({embeds: [this.baseEmbed(`❌ | Your DMs are disabled!`)], ephemeral: true});
        });

        if (!error) return ctx.reply({embeds: [this.baseEmbed(`✅ | Check your DMs!`)], ephemeral: true});
    }
}