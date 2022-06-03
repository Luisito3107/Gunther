const {EmbedBuilder, ButtonStyle} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, SelectMenuBuilder} = require("@discordjs/builders");

const palette = require('image-palette');
const pixels = require('image-pixels');
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: 'lyrics',
    description: 'Get lyrics of a specific/current playing song',
    args: [{
        "name": "title",
        "description": "Song title to search",
        "type": 3,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        let songTitle = ctx.options.getString("title");
        if (!player && !songTitle) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        songTitle = ctx.options.getString("title") ? ctx.options.getString("title") : player.queue.current?.title;
        if (player) {
            songTitle = client.cleanSongTitle(songTitle);
            if (player?.queue?.current?.author) {songTitle = songTitle.trim().replace(new RegExp('('+player?.queue?.current?.author+')', 'gi'), "")+(player?.queue?.current?.author ? " "+player?.queue?.current?.author : "");}
            songTitle = songTitle.trim();
        }

        if (!songTitle) return ctx.reply({embeds: [this.baseEmbed(`❓ | Please specify a song title`)]});

        await ctx.deferReply();
        await ctx.editReply({embeds: [this.baseEmbed('🔍 | Searching lyrics...')]})

        let EMBED_COLOR = client.EMBED_COLOR();
        if (client.lyrics.mode == "genius") {
            const GeniusLogoURL = "https://images.genius.com/ba9fba1d0cdbb5e3f8218cbf779c1a49.300x300x1.jpg"; //"https://t2.genius.com/unsafe/600x600/https%3A%2F%2Fimages.genius.com%2F1d88f9c0c8623d60cf6d85ad3b38a6de.999x999x1.png"
            const lyrics = await client.lyrics.search(songTitle, true).catch(_ => true);
            delete lyrics.source;

            if (typeof lyrics === "boolean") return ctx.editReply({embeds: [this.baseEmbed(`🤷 | No lyrics found in Genius for ${songTitle}`)]});
            let max = 10; if (lyrics.length < max) max = lyrics.length;
            const results = Object.entries(lyrics).slice(0, max).map(entry => entry[1]);


            let lyricsSelectId = `${Math.round(Math.random() * 1000)}`
            let lyricsCancelId = `${Math.round(Math.random() * 1000)}`
            let row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(lyricsSelectId));
            let row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(lyricsCancelId).setLabel("Cancel"))
            const resultsEmbed = new EmbedBuilder()
                .setAuthor({name: `Lyrics found in Genius for ${songTitle}`, iconURL: GeniusLogoURL})
                .setDescription(
                    results.map((track, index) => `\`${++index}.\` [${track.title}](${track.url})\n Artist(s): `+track.artist.name).join('\n\n')
                    +"\n\n\u200B"
                )
                .setColor("#f6f068")
                .setFooter({text: `⏳ Select within 30s or click Cancel`})
            
                        
            for (let d of results.map((x, i) => ({
                label: `${i + 1}. ${String(x.title).length > 50 ? String(x.title).substr(0, 47)+"..." : String(x.title)}`,
                value: `${i}`
            }))) row.components[0].setPlaceholder("Select a result").addOptions(d);

            let message = await ctx.editReply({embeds: [resultsEmbed], components: [row, row2]});

            let response = await message.awaitMessageComponent({
                filter: (i) => i.deferUpdate().catch(_ => void 0) && (i.customId === lyricsSelectId || i.customId === lyricsCancelId) && i.user.id === ctx.user.id,
                time: 30 * 1000
            }).catch(_ => true);

            if (typeof response === "boolean") return ctx.editReply({embeds: [this.baseEmbed(`⌛ | Time out, try again whenever you want!`)], components: []})
            if (response.customId == lyricsCancelId) return await ctx.deleteReply();

            ctx.editReply({embeds: [this.baseEmbed(`✨ | Preparing lyrics...`)], components: []})
            const lyricsResult = results[response.values[0]];

            if (lyricsResult.image) colors = palette(await pixels(lyricsResult.image).catch(_ => null)).colors;
            let lyricsResult_resLrc = await lyricsResult.lyrics();
            lyricsResult_resLrc = lyricsResult_resLrc.replace(/\[(.*?)\]/gi, "*[$1]*");
            const embeds = this.chunkSubstr(lyricsResult_resLrc, 3000).map((l, i) => new EmbedBuilder()
                .setAuthor({name: `${lyricsResult.artist.name} `, iconURL: lyricsResult.artist.thumbnail, url: lyricsResult.artist.url})
                .setTitle(`${lyricsResult.title || "Unknown title"}`)
                .setURL(lyricsResult.url)
                .setDescription(`${l}\n\n\u200B`)
                .setThumbnail(lyricsResult.image || null)
                .setColor(colors[i] || EMBED_COLOR)
                .setFooter({text: `Lyrics powered by Genius`, iconURL: GeniusLogoURL})
            )
            return (embeds.length > 1 ? new Pagination(ctx, embeds, 360 * 1000).start() : ctx.editReply({embeds: [embeds[0]]}));
        } else {
            const lyrics = await client.lyrics.search(songTitle).catch(_ => true);

            if (typeof lyrics === "boolean") return ctx.editReply({embeds: [this.baseEmbed(`No lyrics was found`)]});
    
            let colors = [];
            if (lyrics.artwork) colors = palette(await pixels(lyrics.artwork).catch(_ => null)).colors;
            const embeds = this.chunkSubstr(lyrics.lyrics, 3000).map((l, i) => new EmbedBuilder()
                .setTitle(`${lyrics.title || "Unknown title"}`)
                .setAuthor({name: `${lyrics.artist}`})
                .setDescription(`${l}\n\n\u200B`)
                .setThumbnail(lyrics.artwork || null)
                .setColor(colors[i] || EMBED_COLOR)
                .setFooter({text: `Lyrics powered by ${lyrics.source}`})
            )
    
            return new Pagination(ctx, embeds, 360 * 1000).start();
        }

        
    }
}