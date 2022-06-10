const {EmbedBuilder} = require('discord.js');
const {TrackUtils} = require("erela.js");
const {NODES} = new (require('../../modules/laffeyUtils'))();

module.exports = {
    name: 'play',
    description: 'Add a song or a file to the queue',
    args: [{
        "name": "song",
        "description": "Play a song with a search query or an URL",
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
        "description": "Play a local audio file",
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
        try {
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
                const guildOptions = client.guildOptions[ctx.guildId] || {}
                player.autoplayOnQueueEnd = guildOptions.autoplayOnQueueEnd || false;
                player.connect()
            }
            player = client.player.players.get(ctx.guildId);

            if (player.get('rateLimitStatus').status === true) return ctx.reply({embeds: [this.baseEmbed(`😖 | The music player service is having some troubles, please try again later.`)]});

            let query = "", attachment = undefined, metadata = undefined;
            let res = {};
            const subcommand = ctx.options.getSubcommand(false);
            if (subcommand == "file") {
                attachment = await ctx.options.getAttachment("attachment");
                let fileformat = attachment.name.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
                const allowedFileFormats = ["mp3", "mp4", "flac", "wav", "aac", "ogg"];
                if (allowedFileFormats.indexOf(fileformat) == -1)
                    return ctx.reply({embeds: [this.baseEmbed(`❌ | File format not allowed. Allowed formats: \`${allowedFileFormats.join(", ")}\``)], ephemeral: true});

                await ctx.deferReply();
                await ctx.editReply({embeds: [this.baseEmbed(`✨ | Preparing file to be played...`)]});

                const mm = require('music-metadata');
                const axios = require('axios').default;
                const audioRequest = await axios.get(attachment.attachment, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioRequest.data, "utf-8");
                metadata = await mm.parseBuffer(audioBuffer, fileformat);

                query = attachment.attachment;
                res = await player.search(query, ctx.user)
            } else if (subcommand == "song") {
                query = ctx.options.getString("query");
                await ctx.deferReply();
                await ctx.editReply({embeds: [this.baseEmbed(`🎶 | Preparing tracks...`)]});
                if (query.match(client.Lavasfy.spotifyPattern)) {
                    try {
                        await client.Lavasfy.requestToken();
                        let node = client.Lavasfy.nodes.get(client.connectedToNode || NODES[0].IDENTIFIER);
                        let lavasfyRes = await node.load(query);
    
                        if (lavasfyRes.loadType === "PLAYLIST_LOADED") {
                            res.tracks = []; let lavasfyDuration = 0;
                            await Promise.all(lavasfyRes.tracks.map(async (track) => {
                                let spotifydata = (track.info?.spotifydata ? track.info?.spotifydata : null);
                                let thumbnail = (track.info?.thumbnail ? track.info?.thumbnail : null);
                                track = await track.resolve();
                                track = await TrackUtils.build(track, ctx.user);
                                track.spotifydata = spotifydata;
                                track.thumbnail = thumbnail;
                                res.tracks.push(track);
                                lavasfyDuration += track.duration;
                            }));
                            res.loadType = "PLAYLIST_LOADED";
                            res.playlist = {name: lavasfyRes.playlistInfo.name, thumbnail: lavasfyRes.playlistInfo.thumbnail, duration: lavasfyDuration};
                        } else if (lavasfyRes.loadType.startsWith("TRACK")) {
                            let spotifydata = (lavasfyRes.tracks[0].info?.spotifydata ? lavasfyRes.tracks[0].info?.spotifydata : null);
                            let thumbnail = (lavasfyRes.tracks[0].info?.thumbnail ? lavasfyRes.tracks[0].info?.thumbnail : null);
                            let track = await TrackUtils.build(await lavasfyRes.tracks[0].resolve(), ctx.user);
                            track.spotifydata = spotifydata;
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
            
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) player.destroy();
                return ctx.editReply({embeds: [this.baseEmbed(`💣 | Oops, an error occurred! Please try again in a few minutes.\n` + `\`\`\`${res.exception?.message ? res.exception?.message : 'No error was provided'}\`\`\``)]});
            }

            let EMBED_COLOR = client.EMBED_COLOR();
            var prepareQueueEmbed = function() {
                let duration = (res.tracks[0].isStream ? "🔴 LIVE" : `\`${client.formatDuration(res.tracks[0].duration)}\``);
                const embed = new EmbedBuilder()
                    .setAuthor({name: `Added track to queue`, iconURL: client.assetsURL_icons+"/trackadd.png?color="+EMBED_COLOR.replace("#", "")})
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

            if (Array.isArray(res.tracks)) await Promise.all(res.tracks.map(async (track, index) => {
                if (!attachment && !track.spotifydata && !client.isValidHttpUrl(query)) {
                    let trackArtist = client.cleanSongTitle(track.author);
                    let trackTitle = client.cleanSongTitle(track.title, trackArtist);
                    res.tracks[index].title = trackTitle;
                    res.tracks[index].author = trackArtist;
                    
                    const trackResults = await client.Lavasfy.otherApiRequest("/search", {q: `track:${trackTitle}+artist:${trackArtist}`, type: "track"});
                    if (trackResults) {
                        if (trackResults.tracks.items.length) {
                            const selectedTrack = trackResults.tracks.items[0];
                            res.tracks[index].spotifydata = {authorid: selectedTrack.artists.map(x => x.id), trackid: selectedTrack.id, url: selectedTrack.external_urls.spotify};
                            res.tracks[index].thumbnail = (selectedTrack.album.images.length ? selectedTrack.album.images[0].url : null);
                            res.tracks[index].title = selectedTrack.name;
                            res.tracks[index].author = selectedTrack.artists.map(x => x.name).join(", ");
                            res.tracks[index].uri = selectedTrack.external_urls.spotify;
                        }
                    }
                }
            }));

            switch (res.loadType) {
                case 'NO_MATCHES': {
                    if (!player.queue.current) player.destroy()
                    return ctx.editReply({embeds: [this.baseEmbed(`🤷 | No results found for ${query}`)]});
                }

                case 'TRACK_LOADED':
                case 'SEARCH_RESULT': {
                    if (attachment && typeof metadata != "undefined") {
                        let picture = (metadata?.common?.picture?.length ? metadata?.common?.picture[0] : null);
                        if (picture) {
                            client.createThumbnailsFolder();
                            let thumbnailLocation = "/img/thumbnails/"+new Date().getTime()+".jpg";
                            await require('sharp')(picture.data).resize(640, 640).toFormat('jpg').toFile(process.cwd()+"/src/assets/"+thumbnailLocation, (err, info) => { if (err) { thumbnailLocation = false; } })
                            if (thumbnailLocation) { res.tracks[0].thumbnail = client.assetsURL+thumbnailLocation; }
                        }
                        res.tracks[0].title = metadata.common.title || filename || "Local file";
                        res.tracks[0].author = (metadata.common.artists || ["Unknown"]).join(", ");
                        res.tracks[0].uri = null;
                    }
                    
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

                    if (!player.playing && !player.paused) player.play()
                    await client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
                    return ctx.editReply({embeds: [embed]});
                }
            }
        } catch (e) {
            console.log(e)
            return ctx.editReply({embeds: [this.baseEmbed(`💣 | Oops, an error occurred! Please try again in a few minutes.\n` + `\`\`\`${e ? e : 'No error was provided'}\`\`\``)]});
        }
    }
}