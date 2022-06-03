const {EmbedBuilder} = require('discord.js');
const {splitBar} = require('string-progressbar');
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: 'queue',
    description: 'See the current track queue',
    args: [],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        let j = 0;

        const realQueueEmbedDescription = function(){
            const musicLength = (player.queue.current.isStream ? null : ((!player.queue.current || !player.queue.current.duration || isNaN(player.queue.current.duration)) ? null : player.queue.current.duration))
            const nowTime = (!player.position || isNaN(player.position)) ? null : player.position;
            return `**Currently playing:** \n[${player.queue.current.title}](${player.queue.current.uri}) \\[${player.queue.current.requester}\\]\n`+
            (player.queue.current.isStream ? '🔴 LIVE' :
                `\`${client.formatDuration(player.position)}\` `+
                splitBar(musicLength ? Number(musicLength) : 1, nowTime ? Number(nowTime) : 2, 16, '━', '🔵')[0]+
                ` \`${client.formatDuration(player.queue.current.duration)}\``
            );
        }

        let EMBED_COLOR = client.EMBED_COLOR();        
        let embeds = this.chunkArray(player.queue, 10).map((d) => new EmbedBuilder()
            .setAuthor({name: `Player queue`, iconURL: client.assetsURL_icons+"/queue.png?color="+EMBED_COLOR.replace("#", "")})
            .setColor(EMBED_COLOR)
            .setDescription(realQueueEmbedDescription() + player.queue.length && d.filter(x => !!x).length ?
                `\n`+ (() => {
                    const info = d.filter(x => !!x).map((track) => {
                        let trackTitle = track?.title.length >= 45 ? `${track?.title.slice(0, 45)}...` : track?.title
                        return `\`${++j}.\` [${track.title}](${track.uri}) \n\`${(track.isStream ? '🔴 LIVE' : client.formatDuration(track.duration))}\` **|** Requested by: ${track.requester}\n`
                        //return `${++j} - ${trackTitle}${' '.repeat((48 - (trackTitle.length)))} ${track.isStream ? '◉ LIVE' : ((track.duration || !isNaN(track.duration)) ? new Date(parseInt(track.duration)).toISOString().slice(11, 19) : 'Unknown')}`
                    }).join("\n");

                    return `${realQueueEmbedDescription()}` +
                        `${info ? `\n\n**Up next:**\n ${info}` : 'Not detected'}\n`

                })()
                : `\n\nThere are no more tracks left in the queue!` +
                `Add more songs using the \`play\` command!`+"\n\u200B"
            )
        )
        if (!embeds.length) embeds = [new EmbedBuilder()
            .setAuthor({name: `Player queue`, iconURL: client.assetsURL_icons+"/queue.png?color="+EMBED_COLOR.replace("#", "")})
            .setColor(EMBED_COLOR)
            .setDescription(`${realQueueEmbedDescription()}\n\n Add more songs using the \`play\` command!\n`)
        ]

        await ctx.deferReply();
        return (embeds.length > 1 ? new Pagination(ctx, embeds, 360 * 1000).start() : ctx.editReply({embeds: [embeds[0]]}));
    }
}