const {TrackUtils} = require("erela.js");

const {Manager} = require('erela.js');
const spotify = require('better-erela.js-spotify').default;
const deezer = require('erela.js-deezer');
const apple = require('better-erela.js-apple').default;
const Facebook = require("erela.js-facebook");
const chalk = require('chalk');
const {Collection, EmbedBuilder} = require('discord.js');

const {
    NODES,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
} = new (require('../modules/laffeyUtils'))();

class lavalink extends Manager {
    constructor(client) {
        super({
            nodes: collect(NODES),
            plugins: [new spotify(), new deezer(), new apple(), new Facebook()],
            autoPlay: true,
            shards: 0,
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id)
                if (guild) return guild.shard.send(payload)
            }
        })
        client.rateLimit = new Collection();

        require('./player');
        this.on('nodeConnect', (node) => {
            client.connectedToNode = node.options.identifier;
            console.log(chalk.green(`[LAVALINK] => [STATUS] ${node.options.identifier} successfully connected`))
            client.setClientPresence("ready");
        })

        if (client.AUTO_RESUME_ENABLED) this.once('nodeConnect', () => client.playerHandler.autoResume())

        this.on('nodeError', (node, error) => {
            client.connectedToNode = false;
            console.log(chalk.red(`[LAVALINK] => [STATUS] ${node.options.identifier} encountered an error. Message: ${error.message ? error.message : 'No message'} | ${error.name} | ${error.stack}`))
            client.setClientPresence("error");
        })

        this.on('nodeDisconnect', (node) => {
            client.connectedToNode = false;
            console.log(chalk.redBright(`[LAVALINK] => [STATUS] ${node.options.identifier} disconnected`))
            client.setClientPresence("error");
        })

        this.on('nodeReconnect', (node) => {
            client.connectedToNode = false;
            console.log(chalk.yellowBright(`[LAVALINK] => [STATUS] ${node.options.identifier} is now reconnecting...`))
            client.setClientPresence("connection");
        })

        this.on('playerMove', ((player, oldChannel, newChannel) => {
            if (!newChannel) return player.destroy();
            player.set('moved', true)
            player.setVoiceChannel(newChannel)
            return client.playerHandler.savePlayer(player)
        }))

        this.on('socketClosed', (player, payload) => {
            if (player.get('moved')) return player.set('moved', false)
            if (payload.reason === 'Disconnected.' && payload.byRemote && payload.code === 4014) return player.destroy()
            if (!payload.byRemote) {
                setTimeout(() => {
                    if (player.playing) {
                        player.pause(true)
                        setTimeout(() => {
                            player.pause(false)
                        }, 300);
                    }
                }, 2000);
            } else {
                setTimeout(() => {
                    if (player.playing) {
                        player.pause(true)
                        setTimeout(() => {
                            player.pause(false)
                        }, 200);
                    }
                }, 700);
            }
        })

        this.on('playerDestroy', (player) => {
            if (player.get('message')) player.get('message').delete().catch(_ => void 0);
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }
            return client.playerHandler.delete(player.guild)
        })

        this.on('playerCreate', (player) => {
            player.set('rateLimitStatus', {status: false})
            player.set('24h', {status: false})
        })

        this.on('trackStart', (player, track) => {
            if (player.get('rateLimitStatus').status === true) return;
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }
            if (player.get('message')) player.get('message').delete().catch(_ => void 0);
            const channel = client.channels.cache.get(player.textChannel);

            let presenceData = ""
            const playEmbed = new EmbedBuilder()
                .setAuthor({name: "Now playing", iconURL: client.assetsURL_icons+"/vinyl.gif"})
                .setColor(/*client.EMBED_COLOR()*/ "#50618e");
            
            if (track) {
                let songArtist = client.cleanSongTitle(track.author);
                let songTitle = client.cleanSongTitle(track.title, songArtist);
                presenceData = `${songTitle}${songArtist ? " from "+songArtist : ""}`;
                playEmbed.setTitle(track.title)
                    .setURL(track.uri)
                    .setThumbnail(track?.thumbnail ? track?.thumbnail : null)
                    .setFields([
                        { name: (track.author.split(",").length > 1 ? "Artists" : "Artist"), value: track.author, inline: true },
                        { name: "Duration", value: `${track.isStream ? "🔴 LIVE" : `\`${client.formatDuration(track.duration)}\``}`, inline: true },
                        { name: "Requested by", value: `${track.requester}`, inline: true }
                    ]);
                player.addTrackToRecentQueue(client, track);
            } else {
                presenceData = "some music";
                playEmbed.setDescription("💣 | An unknown error occurred with the current song information, it shouldn't happen again next time.")
            }

            if (player.queueRepeat) playEmbed.setFooter({text: "🔁 Queue loop is enabled. You can disable it with /loop command."});
            else if (player.trackRepeat) playEmbed.setFooter({text: "🔂 Track loop is enabled. You can disable it with /loop command."});

            client.setClientPresence("playing", presenceData);

            channel.send({embeds: [playEmbed]}).then(msg => player.set('message', msg))
            return client.playerHandler.savePlayer(player)
        })
        this.on('trackEnd', (player) => {
            if (player.get('rateLimitStatus').status === true) return;
            if (player.get('message')) player.get('message').delete().catch(_ => void 0);

            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }
        })
        this.on('trackStuck', (player, track, payload) => {
            if (player.get('stuck')) player.get('stuck').delete().catch(_ => void 0);

            const channel = client.channels.cache.get(player.textChannel);

            const playEmbed = new EmbedBuilder()
                .setColor(client.EMBED_COLOR())
                .setDescription(`💣 | Oops, an error occurred while playing *${track.title}*! Please try again in a few minutes.\n\`\`\`${payload?.type ? payload?.type : 'No error was provided'}\`\`\``)

            client.setClientPresence("ready");
            channel.send({embeds: [playEmbed]}).then(msg => player.set('stuck', msg))
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }
        })
        this.on('trackError', (player, track, payload) => {
            const rate = client.rateLimit.get(player.guild)
            const time1 = new Date()
            const time2 = new Date()
            if (rate && (time2 - rate.time <= 500) && player.get('rateLimitStatus').status === false) {
                const channel = client.channels.cache.get(player.textChannel);
                client.setClientPresence("ready");

                const errorEmbed = new EmbedBuilder()
                    .setColor(client.EMBED_COLOR())
                    .setDescription(`💣 | Oops, a lot of errors occurred! Please try again in a few minutes.\nBot messages will be stopped for 40s to prevent spamming.`)

                player.set('rateLimitStatus', {status: true})
                setTimeout(_ => player.set('rateLimitStatus', {status: false}), 40000);
                channel.send({embeds: [errorEmbed]}).then(msg => player.set('rateLimitMsg', msg)).catch(_ => void 0);
            } else if (player.get('rateLimitStatus').status === true) return;
            else {
                if (player.get('error')) player.get('error').delete().catch(_ => void 0);
                if (player.get('rateLimitMsg')) player.get('rateLimitMsg').delete().catch(_ => void 0);

                const channel = client.channels.cache.get(player.textChannel);
                const err = payload.exception ? `Severity: ${payload.exception.severity}\nMessage: ${payload.exception.message}\nCause: ${payload.exception.cause}` : ''

                const errorEmbed = new EmbedBuilder()
                    .setColor(client.EMBED_COLOR())
                    .setDescription(`💣 | Oops, an error occurred while playing *${track.title}*! Please try again in a few minutes.\n\`\`\`${err ? err : 'No error was provided'}\`\`\``)
                channel.send({embeds: [errorEmbed]}).then(msg => player.set('error', msg)).catch(_ => void 0);
                if (player.get('nowplaying')) {
                    clearInterval(player.get('nowplaying'));
                    player.get('nowplayingMSG')?.delete().catch(_ => void 0);
                }
            }
            client.rateLimit.delete(player.guild)
            client.rateLimit.set(player.guild, {time: time1})
        })
        this.on('queueEnd', async (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }

            let EMBED_COLOR = client.EMBED_COLOR();
            const quitPlayer = function(noQueueEmbed) {
                client.setClientPresence("ready");
                if (noQueueEmbed) channel.send({embeds: [noQueueEmbed]}).catch(_ => void 0);
                client.playerHandler.savePlayer(player);
                setTimeout(() => {
                    const e = client.player.players.get(player.guild)
                    if (e && !e.queue.current) {
                        if (e.get('24h').status === true) return;
                        e.destroy();
                        client.playerHandler.delete(e.guild);
                        let EMBED_COLOR = client.EMBED_COLOR();
                        const leftEmbed = new EmbedBuilder()
                            .setAuthor({name: "I had to go", iconURL: client.assetsURL_icons+"/bye.png?color="+EMBED_COLOR.replace("#", "")})
                            .setColor(EMBED_COLOR)
                            .setDescription(`I had to leave the voice channel due to inactivity, but you can make me play music whenever you want with the \`play\` command!`);
                        channel.send({embeds: [leftEmbed]}).catch(_ => void 0);
                    }
                }, 120 * 1000);
            }
            if (player.autoplayOnQueueEnd && player.recentQueue.length) {
                try {
                    let autoPlayEmbed;
                    channel.send({embeds: [new EmbedBuilder()
                        .setAuthor({name: "Queue finished, starting autoplay...", iconURL: client.assetsURL_icons+"/autoplay.png?color="+EMBED_COLOR.replace("#", "")})
                        .setColor(EMBED_COLOR)
                        .setDescription(`There are no more songs in the queue, a mix of similar songs will be added to the queue shortly...`)
                        .setFooter({text: "You can turn off this feature with the /autoplay command."})]}).then(msg => {autoPlayEmbed = msg;})

                    let searchSeeds = {artists: [], tracks: []}
                    player.recentQueue = Array.from(new Set(player.recentQueue.map(track => JSON.stringify(track)))).map(track => JSON.parse(track));
                    player.recentQueue = player.recentQueue.slice(0, Math.min(5, player.recentQueue.length));
                    player.recentQueue.forEach((track, index) => {
                        if (track.resolved) {
                            searchSeeds.artists.push(track.author);
                            searchSeeds.tracks.push(track.title);
                            player.recentQueue.splice(index, 1);
                        }
                    });
                    await Promise.all(player.recentQueue.map(async (track, index) => {
                        if (searchSeeds.tracks.length < player.recentQueue.length) {
                            const trackResults = await client.Lavasfy.otherApiRequest("/search", {q: `track:${track.title}+artist:${track.author}`, type: "track"});
                            if (trackResults) {
                                if (trackResults.tracks.items.length) {
                                    const selectedTrack = trackResults.tracks.items[0];
                                    searchSeeds.artists.push(selectedTrack.artists[0].id);
                                    searchSeeds.tracks.push(selectedTrack.id);
                                }
                            }
                            player.recentQueue.splice(index, 1);
                        }
                    }));
                    searchSeeds.artists = [...new Set(searchSeeds.artists)].filter(n => n);
                    searchSeeds.artists = searchSeeds.artists.slice(0, Math.min(5, searchSeeds.artists.length));
                    searchSeeds.tracks = [...new Set(searchSeeds.tracks)].filter(n => n);
                    searchSeeds.tracks = searchSeeds.tracks.slice(0, Math.min(5, searchSeeds.tracks.length));

                    const recommendationError = async function() {
                        EMBED_COLOR = client.EMBED_COLOR();
                        try {await autoPlayEmbed.delete();} catch (e) {}
                        await channel.send({embeds: [new EmbedBuilder()
                            .setAuthor({name: "Queue finished, no results for autoplay", iconURL: client.assetsURL_icons+"/queuecomplete.png?color="+EMBED_COLOR.replace("#", "")})
                            .setColor(EMBED_COLOR)
                            .setDescription(`There are no more songs in the queue, and I couldn't find any song similar to the ones I played, but you can add more songs with the \`play\` command!`)]}).catch(_ => void 0);
                        player.destroy();
                        await client.playerHandler.delete(client.player.players.get(player.guild));
                        client.setClientPresence("ready");
                        return true;
                    }

                    if (searchSeeds.tracks.length || searchSeeds.artists.length) {
                        let recommendationsQuery = {limit: 15}
                        if (searchSeeds.tracks.length) recommendationsQuery.seed_tracks = searchSeeds.tracks.join(",")
                        if (searchSeeds.artists.length - searchSeeds.tracks.length > 0) recommendationsQuery.seed_artists = searchSeeds.artists.join(",")
                        const recommendationsResult = await client.Lavasfy.otherApiRequest("/recommendations", recommendationsQuery);

                        if (recommendationsResult) {
                            if (recommendationsResult.tracks.length) {
                                let recommendedTracks = recommendationsResult.tracks;
                                recommendedTracks = recommendedTracks.map((track) => track.external_urls.spotify);

                                await client.Lavasfy.requestToken();
                                let node = client.Lavasfy.nodes.get(client.connectedToNode || NODES[0].IDENTIFIER);
                                let res = {tracks: []}; let lavasfyDuration = 0;

                                await Promise.all(recommendedTracks.map(async (track, index) => {
                                    let lavasfyRes = await node.load(track);

                                    let spotifydata = (lavasfyRes.tracks[0].info?.spotifydata ? lavasfyRes.tracks[0].info?.spotifydata : null);
                                    let thumbnail = (lavasfyRes.tracks[0].info?.thumbnail ? lavasfyRes.tracks[0].info?.thumbnail : null);
                                    track = await TrackUtils.build(await lavasfyRes.tracks[0].resolve(), client.user);
                                    track.spotifydata = spotifydata;
                                    track.thumbnail = thumbnail;
                                    res.tracks.push(track);
                                    lavasfyDuration += track.duration;
                                }));
                                
                                try {await autoPlayEmbed.delete();} catch (e) {}
                                EMBED_COLOR = /*"#00b8fb"*/ client.EMBED_COLOR();
                                await channel.send({embeds: [new EmbedBuilder()
                                    .setAuthor({name: "Added autoplay mix to the queue", iconURL: client.assetsURL_icons+"/autoplay.png?color="+EMBED_COLOR.replace("#", "")})
                                    .setTitle(`Mix based on the last ${(searchSeeds.tracks.length > 1 ? `${searchSeeds.tracks.length} songs` : "song")} played ${searchSeeds.artists.length ? (searchSeeds.artists.length > 1 ? `from ${searchSeeds.artists.length} artists` : "") : ""}`)
                                    .setColor(EMBED_COLOR)
                                    .setDescription(`Could any of these songs be your next favorite song? ✨`)
                                    .setFields([
                                        {name: "Tracks", value: String(res.tracks.length), inline: true},
                                        {name: "Duration", value: `\`${client.formatDuration(lavasfyDuration)}\``, inline: true},
                                        //{name: "Queue position", value: `\`${Math.max(player.queue.size-res.tracks.length, 0)}\``, inline: true}
                                    ])
                                    .setThumbnail("https://i.ibb.co/MRd2zgN/Gunther-Auto-Play.png")
                                    .setFooter({text: "You can turn off this feature with the /autoplay command."})
                                ]}).catch(_ => void 0);

                                await player.queue.add(res.tracks);
                                if (!player.playing && !player.paused) player.play()
                                client.playerHandler.savePlayer(player);
                            } else { await recommendationError(); }
                        } else { await recommendationError(); }
                    } else { await recommendationError(); }
                } catch (e) {
                    channel.send({embeds: [ new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`💣 | Oops, an error occurred! Please try again in a few minutes.\n` + `\`\`\`${e ? e : 'No error was provided'}\`\`\``) ]});
                    quitPlayer();
                }
            } else {
                const noQueueEmbed = new EmbedBuilder()
                    .setAuthor({name: "Queue finished", iconURL: client.assetsURL_icons+"/queuecomplete.png?color="+EMBED_COLOR.replace("#", "")})
                    .setColor(EMBED_COLOR)
                    .setDescription(`There are no more songs in the queue, add more with the \`play\` command!`)
                    .setFooter({text: "You can make me play similar songs on queue end with the /autoplay command."});
                
                quitPlayer(noQueueEmbed);
            }
        })
    }
}

function collect(node) {
    return node.map(x => {
        if (!x.HOST) throw new RangeError('Host must be provided')
        if (typeof x.PORT !== 'number') throw new RangeError('Port must be a number')
        if (typeof x.RETRY_AMOUNT !== 'number') throw new RangeError('Retry amount must be a number')
        if (typeof x.RETRY_DELAY !== 'number') throw new RangeError('Retry delay must be a number')
        if (typeof x.SECURE !== 'boolean') throw new RangeError('Secure must be a boolean')
        return {
            host: x.HOST,
            password: x.PASSWORD ? x.PASSWORD : 'youshallnotpass',
            port: x.PORT || 8080,
            identifier: x.IDENTIFIER || x.HOST,
            retryAmount: x.RETRY_AMOUNT,
            retryDelay: x.RETRY_DELAY,
            secure: x.SECURE
        };
    });
}


module.exports = lavalink;