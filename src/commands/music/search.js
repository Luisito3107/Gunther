const {EmbedBuilder, ButtonStyle} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, SelectMenuBuilder} = require("@discordjs/builders");
const {TrackUtils} = require("erela.js");
const {NODES} = new (require('../../modules/laffeyUtils'))();

module.exports = {
    name: 'search',
    description: 'Search and play a specific song',
    args: [{
        "name": "query",
        "description": "Search query or URL of the song to play",
        "type": 3,
        "required": true
    }],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;

        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        const permissions = ctx.member.voice.channel.permissionsFor(client.user);
        if (!channel.permissionsFor(client.user).has(["Connect", "Speak"])) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | I don't have \`Connect\` and \`Speak\` permissions in your channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | I\'m already playing music on another voice channel`)]});

        if (!player) {
            player = client.player.create({
                guild: ctx.guildId,
                voiceChannel: channel.id,
                textChannel: ctx.channel.id,
                selfDeafen: true
            });
            player.connect()
        }
        player = client.player.players.get(ctx.guildId);

        if (player.get('rateLimitStatus').status === true) return ctx.reply({embeds: [this.baseEmbed(`😖 | The music player service is having some troubles, please try again later.`)]});
        await ctx.deferReply();

        let res = {}
        query = ctx.options.getString("query");
        await ctx.editReply({embeds: [this.baseEmbed(`🔍 | Searching tracks...`)]});
        if (query.match(client.Lavasfy.spotifyPattern)) {
            try {
                await client.Lavasfy.requestToken();
                let node = client.Lavasfy.nodes.get(NODES[0].IDENTIFIER);
                let lavasfyRes = await node.load(query);

                if (lavasfyRes.loadType === "PLAYLIST_LOADED") {
                    res.tracks = []; let lavasfyDuration = 0;
                    await Promise.all(lavasfyRes.tracks.map(async (track) => {
                        let thumbnail = (track.info?.thumbnail ? track.info?.thumbnail : null);
                        track = await track.resolve();
                        track = await TrackUtils.build(track, ctx.user);
                        track.thumbnail = thumbnail;
                        res.tracks.push(track);
                        lavasfyDuration += track.duration;
                    }));
                    res.loadType = "PLAYLIST_LOADED";
                    res.playlist = {name: lavasfyRes.playlistInfo.name, duration: lavasfyDuration};
                } else if (lavasfyRes.loadType.startsWith("TRACK")) {
                    let thumbnail = (lavasfyRes.tracks[0].info?.thumbnail ? lavasfyRes.tracks[0].info?.thumbnail : null);
                    let track = await TrackUtils.build(await lavasfyRes.tracks[0].resolve(), ctx.user);
                    track.thumbnail = thumbnail;
                    res.tracks = [track];
                    res.loadType = "TRACK_LOADED";
                } else {
                    res.loadType = "NO_MATCHES"; query = "that Spotify URL";
                }
            } catch (error) {
                res = {loadType: "LOAD_FAILED", exception: {message: error.toString()}};
            }
        } else {
            res = await player.search(query, ctx.user)
            query = `\`${query}\``;
        }


        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return ctx.editReply({embeds: [this.baseEmbed(`💣 | Oops, an error occoured! Please try again in a few minutes.\n` + `\`\`\`${res.exception?.message ? res.exception?.message : 'No error was provided'}\`\`\``)]});
        }

        let EMBED_COLOR = client.EMBED_COLOR();
        var prepareQueueEmbed = function(track) {
            track = track || res.tracks[0];

            let duration = (track.isStream ? "🔴 LIVE" : `\`${client.formatDuration(track.duration)}\``);
            const embed = new EmbedBuilder()
                .setAuthor({name: `Added track to queue`, iconURL: client.assetsURL_icons+"/trackadd.png?color="+EMBED_COLOR.replace("#", "")})
                .setTitle(track.title)
                .setURL(track.uri)
                .setColor(EMBED_COLOR)
                .setFields([
                    {name: (track.author.split(",").length > 1 ? "Artists" : "Artist"), value: track.author, inline: true},
                    {name: "Duration", value: duration, inline: true},
                    {name: "Queue position", value: `\`${player.queue.size}\``, inline: true}
                ]);

            if (track.thumbnail) embed.setThumbnail(track.thumbnail);

            return embed;
        }
        
        switch (res.loadType) {
            case 'NO_MATCHES': {
                if (!player.queue.current) player.destroy();
                return ctx.editReply({embeds: [this.baseEmbed(`🤷 | No results found for ${query}`)]});
            }

            case 'TRACK_LOADED': {
                await player.queue.add(res.tracks[0]);

                if (!player.playing && !player.paused) player.play()
                await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
                return ctx.editReply({embeds: [prepareQueueEmbed()]});
            }

            case 'PLAYLIST_LOADED': {
                await player.queue.add(res.tracks);

                let duration = `\`${client.formatDuration(res.playlist.duration)}\``;
                const embed = new EmbedBuilder()
                    .setAuthor({name: `Added playlist to queue`, iconURL: client.assetsURL_icons+"/playlistadd.png?color="+EMBED_COLOR.replace("#", "")})
                    .setTitle(res.playlist.name)
                    .setColor(EMBED_COLOR)
                    .setFields([
                        {name: "Tracks", value: String(res.tracks.length), inline: true},
                        {name: "Duration", value: duration, inline: true},
                        {name: "Queue position", value: `\`${Math.max(player.queue.size-res.tracks.length, 0)}\``, inline: true}
                    ]);
                    if (client.isValidHttpUrl(query)) embed.setURL(query)

                for (let i = 0; i < res.tracks.length; i++) {
                    if (res.tracks[i].thumbnail) {
                        embed.setThumbnail(res.tracks[i].thumbnail);
                        break;
                    }
                }

                if (!player.playing && !player.paused) player.play()
                await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
                return ctx.editReply({embeds: [embed]});
            }


            case 'SEARCH_RESULT': {
                let max = 10; if (res.tracks.length < max) max = res.tracks.length;
                res.tracks = res.tracks.slice(0, max);

                let searchSelectId = `${Math.round(Math.random() * 1000)}`
                let searchCancelId = `${Math.round(Math.random() * 1000)}`
                let row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(searchSelectId));
                let row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(searchCancelId).setLabel("Cancel"))
                const resultsEmbed = new EmbedBuilder()
                    .setAuthor({name: `Songs and playlists found for ${query}`, iconURL: client.assetsURL_icons+"/search.png?color="+EMBED_COLOR.replace("#", "")})
                    .setDescription(
                        res.tracks.map((track, index) => `\`${++index}.\` [${track.title}](${track.uri})\n Artist(s): ${(track.author ? track.author : "Unknown")}`).join('\n\n')
                        +"\n\n\u200B"
                    )
                    .setColor(EMBED_COLOR)
                    .setFooter({text: `⏳ Select within 30s or click Cancel`})
                            
                for (let d of res.tracks.map((x, i) => ({
                    label: `${i + 1}. ${String(x.title).length > 50 ? String(x.title).substr(0, 47)+"..." : String(x.title)}`,
                    value: `${i}`
                }))) row.components[0].setPlaceholder("Select a result").addOptions(d);

                let message = await ctx.editReply({embeds: [resultsEmbed], components: [row, row2]});

                let response = await message.awaitMessageComponent({
                    filter: (i) => i.deferUpdate().catch(_ => void 0) && (i.customId === searchSelectId || i.customId === searchCancelId) && i.user.id === ctx.user.id,
                    time: 30 * 1000
                }).catch(_ => true);

                if (typeof response === "boolean") return ctx.editReply({embeds: [this.baseEmbed(`⌛ | Time out, try again whenever you want!`)], components: []})
                if (response.customId == searchCancelId) return await ctx.deleteReply();

                ctx.editReply({embeds: [this.baseEmbed(`🎶 | Preparing tracks...`)], components: []})

                let track = res.tracks[response.values[0]]
                player.queue.add(track);
                if (!player.playing && !player.paused) player.play();
                return ctx.editReply({embeds: [prepareQueueEmbed()]});

                return false;

                /*let randomNumber = `${Math.round(Math.random() * 1000)}`
                let row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(randomNumber));
                let tracks = res.tracks;

                for (let d of res.tracks.map((x, i) => ({
                    label: `${i + 1} - ${x.title.length > 50 ? x.title.substr(0, 47) : x.title}`,
                    value: `${i}`
                }))) row.components[0].addOptions(d);

                let message = await ctx.editReply({content: `Select track below`, components: [row]});

                let response = await message.awaitMessageComponent({
                    filter: (i) => i.deferUpdate().catch(_ => void 0) && i.customId === randomNumber && i.user.id === ctx.user.id,
                    time: 15 * 1000
                }).catch(_ => true);

                if (typeof response === "boolean") return message.edit({content: `No response...`, components: []});
                let track = tracks[response.values[0]]
                player.queue.add(track);
                if (!player.playing && !player.paused) player.play();
                return ctx.editReply({embeds: [this.baseEmbed(`Force played ${track.title} [${!track.isStream ? `${new Date(track.duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`)]});*/
            }
        }
    }
}