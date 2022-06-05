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
            console.log(chalk.green(`[LAVALINK] => [STATUS] ${node.options.identifier} successfully connected`))
            client.setClientPresence("ready");
        })

        if (client.AUTO_RESUME_ENABLED) this.once('nodeConnect', () => client.playerHandler.autoResume())

        this.on('nodeError', (node, error) => {
            console.log(chalk.red(`[LAVALINK] => [STATUS] ${node.options.identifier} encountered an error. Message: ${error.message ? error.message : 'No message'} | ${error.name} | ${error.stack}`))
            client.setClientPresence("error");
        })

        this.on('nodeDisconnect', (node) => {
            console.log(chalk.redBright(`[LAVALINK] => [STATUS] ${node.options.identifier} disconnected`))
            client.setClientPresence("error");
        })

        this.on('nodeReconnect', (node) => {
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
                        { name: "Duration", value: `${track.isStream ? "🔴 LIVE" : client.formatDuration(track.duration)}`, inline: true },
                        { name: "Requested by", value: `${track.requester}`, inline: true }
                    ]);
            } else {
                presenceData = "some music";
                playEmbed.setDescription("💣 | An unknown error occurred with the current song information, it shouldn't happen again next time.")
            }
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
        this.on('queueEnd', (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            let EMBED_COLOR = client.EMBED_COLOR();
            const noQueueEmbed = new EmbedBuilder()
                .setAuthor({name: "Queue finished", iconURL: client.assetsURL_icons+"/queuecomplete.png?color="+EMBED_COLOR.replace("#", "")})
                .setColor(EMBED_COLOR)
                .setDescription(`There are no more songs in the queue, add more with the \`play\` command!`);
            if (player.get('nowplaying')) {
                clearInterval(player.get('nowplaying'));
                player.get('nowplayingMSG')?.delete().catch(_ => void 0);
            }
            client.setClientPresence("ready");
            channel.send({embeds: [noQueueEmbed]}).catch(_ => void 0);
            client.playerHandler.savePlayer(player);
            setTimeout(() => {
                const e = client.player.players.get(player.guild)
                if (e && !e.queue.current) {
                    e.destroy()
                    let EMBED_COLOR = client.EMBED_COLOR();
                    const leftEmbed = new EmbedBuilder()
                        .setAuthor({name: "I had to go", iconURL: client.assetsURL_icons+"/bye.png?color="+EMBED_COLOR.replace("#", "")})
                        .setColor(EMBED_COLOR)
                        .setDescription(`I had to leave the voice channel due to inactivity, but you can make me play music whenever you want with the \`play\` command!`);
                    channel.send({embeds: [leftEmbed]}).catch(_ => void 0);
                }
            }, 60 * 1000);
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