const {EmbedBuilder} = require('discord.js');
const {splitBar} = require("string-progressbar");
module.exports = {
    name: 'nowplaying',
    description: 'Get details of the currently playing song',
    args: [],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (player.get("nowplaying")) {
            clearInterval(player.get("nowplaying"));
            player.get("nowplayingMSG").delete().catch(_ => void 0);
        } 

        let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration),
            nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

        const embed = (p, l, n) => new EmbedBuilder()
            .setAuthor({name: "Now playing", iconURL: client.assetsURL_icons+"/vinyl.gif"})
            .setColor(/*client.EMBED_COLOR()*/ "#50618e")

            .setTitle(`${p.queue.current.title}`)
            .setURL(p.queue.current.uri)
            .setThumbnail(p.queue.current.thumbnail || null)
            .setDescription(
                `**Requested by: ** ${p.queue.current.requester}\n\n`+
                (p.queue.current.isStream ? '🔴 LIVE' :
                    `\`${client.formatDuration(p.position)}\` `+
                    splitBar(l ? Number(l) : 1, n ? Number(n) : 2, 16, '━', '🔵')[0]+
                    ` \`${client.formatDuration(p.queue.current.duration)}\``
                )
            )
            if (!p.queue.current.isStream) embed.setFooter({text: `${client.formatDuration(l - n) + ' left'}`})

        await ctx.deferReply();
        ctx.editReply({embeds: [embed(player, musicLength, nowTime)]}).then(m => player.set("nowplayingMSG", m));

        const interval = setInterval(() => {
            player = client.player.players.get(ctx.guildId);
            let musicLength = player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration),
                nowTime = (!player.position || isNaN(player.position)) ? null : player.position;

            return player ? player.get("nowplayingMSG") ? player.get("nowplayingMSG").edit({embeds: [embed(player, musicLength, nowTime)]}).catch(_ => clearInterval(interval)) : void 0 : clearInterval(interval);
        }, 5000);
        player.set("nowplaying", interval);
    }
}