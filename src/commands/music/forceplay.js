const {EmbedBuilder} = require('discord.js');
const {TrackUtils} = require("erela.js");
const {NODES} = new (require('../../modules/laffeyUtils'))();

module.exports = {
    name: 'forceplay',
    description: 'Force the playing of a song or a file',
    args: [{
        "name": "song",
        "description": "Force the playing of a song with a search query or an URL",
        "type": 1,
        "required": false,
        "options": [{
            "name": "query",
            "description": "Search query or URL of the song/playlist to play",
            "type": 3,
            "required": true
        }]
    }, {
        "name": "file",
        "description": "Force the playing of a local audio file",
        "type": 1,
        "required": false,
        "options": [{
            "name": "attachment",
            "description": "Audio attachment to play",
            "type": 11,
            "required": true
        }]
    }],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;

        if (!player) return client.commands.get("play").execute.call(this, ctx, client);

        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | I\'m already playing music on another voice channel`)]});
        
        if (player.get('rateLimitStatus').status === true) return ctx.editReply({embeds: [this.baseEmbed(`😖 | The music player service is having some troubles, please try again later.`)]});

        let query = "", attachment = undefined, metadata = undefined;
        let res = {};
        const subcommand = ctx.options.getSubcommand(false);
        if (subcommand == "file") {
            attachment = ctx.options.getAttachment("attachment");
            let fileformat = attachment.name.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
            const allowedFileFormats = ["mp3", "aac", "ogg", "flac", "wma", "mp4"];
            if (allowedFileFormats.indexOf(fileformat) == -1)
                return ctx.reply({embeds: [this.baseEmbed(`❌ | File format not allowed. Allowed formats: \`${allowedFileFormats.join(", ")}\``)], ephemeral: true});

            await ctx.deferReply();
            await ctx.editReply({embeds: [this.baseEmbed(`✨ | Preparing file to be played...`)]});

            const mm = require('music-metadata');
            const axios = require('axios').default;
            const audioRequest = await axios.get(attachment.url, { responseType: 'arraybuffer' });
            const audioBuffer = Buffer.from(audioRequest.data, "utf-8");
            metadata = await mm.parseBuffer(audioBuffer, fileformat);

            query = attachment.url;
            res = await player.search(query, ctx.user)
        } else if (subcommand == "song") {
            query = ctx.options.getString("query");
            await ctx.deferReply();
            await ctx.editReply({embeds: [this.baseEmbed(`🎶 | Preparing tracks...`)]});
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
                        res.playlist = {name: lavasfyRes.playlistInfo.name, thumbnail: lavasfyRes.playlistInfo.thumbnail, duration: lavasfyDuration};
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
        }


        const currentSong = player.queue.current;

        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return ctx.editReply({embeds: [this.baseEmbed(`💣 | Oops, an error occurred! Please try again in a few minutes.\n` + `\`\`\`${res.exception?.message ? res.exception?.message : 'No error was provided'}\`\`\``)]});
        }

        let EMBED_COLOR = client.EMBED_COLOR();
            var prepareQueueEmbed = function() {
                let duration = (res.tracks[0].isStream ? "🔴 LIVE" : `\`${client.formatDuration(res.tracks[0].duration)}\``);
                const embed = new EmbedBuilder()
                    .setAuthor({name: `Force playing track`, iconURL: client.assetsURL_icons+"/play.png?color="+EMBED_COLOR.replace("#", "")})
                    .setTitle(res.tracks[0].title)
                    .setURL(res.tracks[0].uri)
                    .setColor(EMBED_COLOR)
                    .setFields([
                        {name: (res.tracks[0].author.split(",").length > 1 ? "Artists" : "Artist"), value: res.tracks[0].author, inline: true},
                        {name: "Duration", value: duration, inline: true},
                        {name: "Queue position", value: `\`${player.queue.size}\``, inline: true}
                    ]);
    
                if (res.tracks[0].thumbnail) embed.setThumbnail(res.tracks[0].thumbnail);
    
                return embed;
            }

        switch (res.loadType) {
            case 'NO_MATCHES': {
                if (!player.queue.current) player.destroy()
                return ctx.editReply({embeds: [this.baseEmbed(`No music was found.`)]});
            }

            case 'TRACK_LOADED':
            case 'SEARCH_RESULT': {
                if (attachment && typeof metadata != "undefined") {
                    let picture = (metadata?.common?.picture?.length ? metadata?.common?.picture[0] : null);
                    if (picture) {
                        let thumbnailLocation = "/img/thumbnails/"+new Date().getTime()+".jpg";
                        await require('sharp')(picture.data).resize(640, 640).toFormat('jpg').toFile(process.cwd()+"/src/assets/"+thumbnailLocation, (err, info) => { if (err) { thumbnailLocation = false; } })
                        if (thumbnailLocation) { res.tracks[0].thumbnail = client.assetsURL+thumbnailLocation; }
                    }
                    res.tracks[0].title = metadata.common.title || filename || "Local file";
                    res.tracks[0].author = (metadata.common.artists || ["Unknown"]).join(", ");
                    res.tracks[0].uri = null;
                }

                player.play(res.tracks[0]);
                if (currentSong) player.queue.unshift(currentSong);
                return ctx.editReply({embeds: [prepareQueueEmbed()]});
            }

            case 'PLAYLIST_LOADED': {
                player.play(res.tracks.shift());
                const targetQueue = res.tracks.concat(player.queue);
                player.queue.clear();
                for (let song of targetQueue) player.queue.add(song);
                if (currentSong) player.queue.unshift(currentSong);

                let duration = `\`${client.formatDuration(res.playlist.duration)}\``;
                const embed = new EmbedBuilder()
                    .setAuthor({name: `Force played playlist`, iconURL: client.assetsURL_icons+"/playlistplay.png?color="+EMBED_COLOR.replace("#", "")})
                    .setTitle(res.playlist.name)
                    .setColor(EMBED_COLOR)
                    .setFields([
                        {name: "Tracks", value: String(res.tracks.length), inline: true},
                        {name: "Duration", value: duration, inline: true},
                        {name: "Queue position", value: `\`${Math.max(player.queue.size-res.tracks.length, 0)}\``, inline: true}
                    ]);
                    if (client.isValidHttpUrl(query)) embed.setURL(query)

                    if (res.playlist.thumbnail) {
                        embed.setThumbnail(res.playlist.thumbnail);
                    } else {
                        for (let i = 0; i < res.tracks.length; i++) {
                            if (res.tracks[i].thumbnail) {
                                embed.setThumbnail(res.tracks[i].thumbnail);
                                break;
                            }
                        }
                    }

                return ctx.editReply({embeds: [embed]});
            }
        }
    }
}