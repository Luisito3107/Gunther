const {EmbedBuilder} = require('discord.js');
const { uptime, totalmem, freemem, cpus } = require('os');
const prettyMs = require('pretty-ms');
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: "stats",
    description: "Get bot statitics and metrics",
    args: [{
        "name": "type",
        "description": "Get advanced statistics",
        "type": 3,
        "required": false,
        "choices": [
            {name: "Advanced", value: "adv"}
        ]
    }],
    async execute(ctx, client) {
        let EMBED_COLOR = client.EMBED_COLOR();
        const embed = function(adv) {
            adv = adv || false;
            return new EmbedBuilder()
                .setAuthor({name: `Stats${adv ? " (advanced)" : ""}`, iconURL: client.assetsURL_icons+"/status.png?color="+EMBED_COLOR.replace("#", "")})
                .setColor(EMBED_COLOR)
        }
        embed.bind(client, EMBED_COLOR)

        if (ctx.options.getString("type") == "adv") {
            await ctx.deferReply();
            const memusage = process.memoryUsage();
            const cs = cpus();
            
            getCpuUsage = async function() {
                const cs = cpus();
                const percentage = cs.map((cpu, counter) => {
                    let total = 0;
                    for (let type in cpu.times) {
                        total += cpu.times[type];
                    }
                    return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
                }).reduce((x, y) => x + y[0], 0) / cs.length
                return percentage;
            }
            getSystemCpuUsage = async function() {
                const cs = cpus();
                const percentage = cs.map((cpu, counter) => {
                    let total = 0;
                    for (let type in cpu.times) {
                        total += cpu.times[type];
                    }
                    return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
                }).reduce((x, y) => x + y[2], 0) / cs.length
                return percentage;
            }
            getIdleCpuUsage = async function() {
                const cs = cpus();
                const percentage = cs.map((cpu, counter) => {
                    let total = 0;
                    for (let type in cpu.times) {
                        total += cpu.times[type];
                    }
                    return Object.entries(cpu.times).map(t => Math.round(100 * t[1] / total))
                }).reduce((x, y) => x + y[3], 0) / cs.length
                return percentage;
            }
        
            let embeds = [
                embed(true).setDescription(`\`\`\`nim` + '\n' +
                    `Guilds          :: ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}\n` +
                    `Users/Cached    :: ${client.users.cache.size} user${client.users.cache.size > 1 ? 's' : ''}/${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} cached user${(client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)) > 1 ? 's' : ''}\n` +
                    `Channels        :: ${client.channels.cache.size} channel${client.channels.cache.size > 1 ? 's' : ''}\n` +
                    `Emojis          :: ${client.emojis.cache.size} emoji${client.emojis.cache.size > 1 ? 's' : ''}\n` +
                    `Roles           :: ${client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0)} role${(client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0)) > 1 ? 's' : ''}\n` +
                    `Players         :: ${client.player.players.size} player${client.player.players.size > 1 ? 's' : ''}\n` +
                    `Uptime          :: ${prettyMs(client.uptime)}\n` +
                    `Server Uptime   :: ${prettyMs(uptime() * 1000)}\n` +
                    `\n` + `\`\`\``)
                    .setFooter({text: `Page 1 / 3`}),
                embed(true).setDescription(`\`\`\`nim` + '\n' +
                    `Total Memory  :: ${Math.round(totalmem() / 1024 / 1024)} mb\n` +
                    `Free Memory   :: ${Math.round(freemem() / 1024 / 1024)} mb\n` +
                    `RSS           :: ${Math.round(memusage.rss / 1024 / 1024)} mb\n` +
                    `Heap Total    :: ${Math.round(memusage.heapTotal / 1024 / 1024)} mb\n` +
                    `Heap Used     :: ${Math.round(memusage.heapUsed / 1024 / 1024)} mb\n` +
                    `External      :: ${Math.round(memusage.external / 1024 / 1024)} mb\n` +
                    `Array Buffer  :: ${Math.round(memusage.rss / 1024 / 1024)} mb\n` +
                    `\n` + `\`\`\``)
                    .setFooter({text: `Page 2 / 3`}),
                embed(true).setDescription(`\`\`\`nim` + '\n' +
                    `CPU Model     :: ${cs[0].model}\n` +
                    `Cores         :: ${cs.length}\n` +
                    `Speed         :: ${cs[0].speed}Mhz\n` +
                    `Bot's Usage   :: ${await getCpuUsage()}%\n` +
                    `System        :: ${await getSystemCpuUsage()}%\n` +
                    `Idle          :: ${await getIdleCpuUsage()}%\n` +
                    `Platform      :: ${process.platform}\n` +
                    `PID           :: ${process.pid}\n` +
                    `\n` + `\`\`\``)
                    .setFooter({text: `Page 3 / 3`})
            ]
            
            return new Pagination(ctx, embeds, 120 * 1000).start();
        } else {
            let statsEmbed = embed().setDescription(`\`\`\`nim` + '\n' +
                `Guilds          :: ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}\n` +
                `Users/Cached    :: ${client.users.cache.size} user${client.users.cache.size > 1 ? 's' : ''}/${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} cached user${(client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)) > 1 ? 's' : ''}\n` +
                `Channels        :: ${client.channels.cache.size} channel${client.channels.cache.size > 1 ? 's' : ''}\n` +
                `Players         :: ${client.player.players.size} player${client.player.players.size > 1 ? 's' : ''}\n` +
                `RSS/Heap Total  :: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} mb/${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} mb\n` +
                `Uptime          :: ${prettyMs(client.uptime)}\n` +
                `\n` + `\`\`\``);

            return ctx.reply({embeds: [statsEmbed]});
        }
    }
}