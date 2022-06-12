const { LavasfyClient } = require("./modules/customlavasfy/dist/index.js");
const formatDuration = require('format-duration')
const { AUTO_RESUME_ENABLED, IP_ADDR, EMBED_COLOR, HEX_TO_RGBTUPLE, GENERATE_ICON } = new (require('./modules/guntherUtils'))();
const { DiscordTogether } = require('discord-together');
const guildOptionsHandler = require('./modules/guildOptionsHandler');
const autoplayHandler = require('./modules/autoplayHandler');

const {Client, Collection, EmbedBuilder} = require('discord.js');
const {TOKEN, MONGODB_URI, OWNERS, LYRICS_ENGINE, NODES, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET} = new (require('./modules/laffeyUtils'))();
const eventHandler = require('./modules/eventHandler');
const playerHandler = require('./modules/playerHandler');
const lyricsHandler = require('./modules/lyricsHandler');
const chalk = require('chalk');
const commandHandler = require('./handlers/command.js');
const loggerHandler = require('./handlers/logger.js');
const mongoose = require('mongoose');
const ClientOptions = require("./ClientOptions");


class Gunther extends Client {
    constructor() {
        super(ClientOptions);

        this.loginMongo().then(async x => {
            this.database = !!x;
            if (!x) {
                this.logger.error('MONGODB URI is either not provided or invalid. Extra feature (prefix) won\'t be available')
            } else {
                this.logger.log('DATABASE', 'Connected to database')
                await new Promise(r => setTimeout(r, 1000));
            }
        })

        // Start making base data on client //
        this.commands = new Collection();
        this.voiceTimeout = new Collection();
        this.logger = new loggerHandler();
        this.playerHandler = new playerHandler(this);
        this.lyrics = new lyricsHandler(this, LYRICS_ENGINE);
        this.owners = OWNERS;

        // Gunther custom
            // Lavasfy
                this.Lavasfy = new LavasfyClient({
                    clientID: SPOTIFY_CLIENT_ID,
                    clientSecret: SPOTIFY_CLIENT_SECRET,
                    filterAudioOnlyResult: true,
                    autoResolve: false,
                    useSpotifyMetadata: true,
                }, [{
                    id: NODES[0].IDENTIFIER,
                    host: NODES[0].HOST,
                    port: NODES[0].PORT,
                    password: NODES[0].PASSWORD,
                    secure: NODES[0].SECURE,
                }]);
            // Variables
                this.connectedToNode = false;
                this.guildOptionsHandler = new guildOptionsHandler(this);
                this.guildOptions = [];
                this.autoplayHandler = new autoplayHandler(this);
                this.AUTO_RESUME_ENABLED = AUTO_RESUME_ENABLED;
                this.EMBED_COLOR = EMBED_COLOR;
                this.HEX_TO_RGBTUPLE = HEX_TO_RGBTUPLE;
                this.assetsURL = "http://"+IP_ADDR+":3000/assets";
                this.assetsURL_icons = this.assetsURL+"/img/icons";
                this.assetsURL_thumbnails = this.assetsURL+"/img/thumbnails"
                this.formatDuration = formatDuration;
                this.cleanSongTitle = function(songTitle, artist) {
                    artist = artist || null;
                    songTitle = songTitle.replace(
                        /lyrics|lyric|lyrical|official music video|\(official music video\)|audio|official|official video|official video hd|official hd video|official video music|\(official video music\)|extended|video|hd|topic|vevo|hq|4k|mv|([（）])|([()])|-|–|(\[.+\])/gi,
                        ""
                    );
                    if (artist) {songTitle = songTitle.trim().replace(new RegExp('('+artist+')', 'gi'), "");}
                    return songTitle.trim();
                }
                this.setClientPresence = function(type, presenceData) {
                    presenceData = presenceData || false;
                    switch (type) {
                        case "ready":
                            this.user.setPresence({ activities: [{name: `/help`, type: 2}], status: 'online', afk: false });
                            break;
                        case "connection":
                            this.user.setPresence({ activities: [{name: `Gunther's connection`, type: 0}], status: 'idle', afk: true });
                            break;
                        case "error":
                            this.user.setPresence({ activities: [{name: `out of service`, type: 3}], status: 'dnd', afk: false });
                            break;
                        case "playing":
                            this.user.setPresence({ activities: [{name: `${presenceData}`, type: 2}], status: 'online', afk: false });
                            break;
                        default:
                            break;
                    }
                }
                this.checkForNickname = async function(newMember, ctx, message) {
                    let currentNickname = (newMember.nickname || "Gunther").toLowerCase();
                    if (currentNickname.replaceAll(" ", "").replaceAll("gunther", "").length > 5 || currentNickname.indexOf("gunther") < 0) {
                        await newMember.setNickname("Gunther");
                        const nicknameEmbed = new EmbedBuilder().setColor(EMBED_COLOR())
                            .setDescription("😶 | I'm sorry, but I think I'd rather just be called Gunther!");
                        if (ctx) {
                            return ctx.channel.send({embeds: [nicknameEmbed]});
                        } else {
                            let channel;
                            if (message) channel = message.channel;
                            else {
                                let defaultChannel = "";
                                await Promise.all(newMember.guild.channels.cache.map(async (channel) => {
                                    if(channel.type == 0 && defaultChannel == "") {
                                        if (channel.permissionsFor(newMember).has(["SendMessages"])) { defaultChannel = channel; }
                                    }
                                }));
                                channel = defaultChannel;
                            }
                            return channel ? channel.send({embeds: [nicknameEmbed]}) : false;
                        }
                    }
                }
                this.discordTogether = new DiscordTogether(this);
                this.isValidHttpUrl = function(string) {
                    let url;
                    try { url = new URL(string); } catch (_) { return false; }
                    return url.protocol === "http:" || url.protocol === "https:";
                }
                this.createThumbnailsFolder = function() {
                    const fs = require('fs');
                    const thumbnailsURL = process.cwd()+"/src/assets/img/thumbnails";
                    if (!fs.existsSync(thumbnailsURL)){ fs.mkdirSync(thumbnailsURL, { recursive: true }); }
                }
            // Web server
                var webserver_path = require('path');
                var webserver_express = require('express');
                var webserver_app = webserver_express();
                var dir = webserver_path.join(__dirname, 'assets');
                this.createThumbnailsFolder();
                webserver_app.all('/', (req, res) => { res.send('Gunther is alive!'); });
                webserver_app.get("/assets/img/icons/:name", function(req, res) { GENERATE_ICON(EMBED_COLOR, req, res); });
                webserver_app.get("/assets/img/thumbnails/:pic", function(req, res) {
                    const thumbnailPath = process.cwd()+"/src/assets/img/thumbnails/"+req.params.pic;
                    try {
                        if (require('fs').existsSync(thumbnailPath)) { res.sendFile(thumbnailPath); }
                        else { res.writeHead(404); res.end(); }
                    } catch(error) { res.writeHead(500); res.end(); console.log(error); }
                });
                webserver_app.listen(3000, ()=>{console.log(chalk.cyan("[DEBUG] => [WEBSERVER] Listening requests on port 3000"))});
                // Remove old thumbnails
                    const findRemoveSync = require('find-remove')
                    findRemoveSync(process.cwd()+"/src/assets/img/thumbnails", {age: { seconds: 43200 }, extensions: '.jpg'});
                    setInterval(function() {findRemoveSync(process.cwd()+"/src/assets/img/thumbnails", {age: { seconds: 43200 }, extensions: '.jpg'})}, 3600000)

        // Collect needed data to client //
        new eventHandler(this).start();
        commandHandler.bind(this)();
    }

    async loginMongo() {
        let available = false
        if (!MONGODB_URI) return available;

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            useFindAndModify: true
        }).then(() => {
            available = true
        }).catch(() => {
            available = false
        })
        return available
    }

    async login() {
        if (!TOKEN) throw new RangeError('You must include TOKEN to login either in config.json or env')
        await super.login(TOKEN)
            .then(x => { return x })
            .catch(err => console.log(chalk.red(err)))
    }
}

module.exports = Gunther;