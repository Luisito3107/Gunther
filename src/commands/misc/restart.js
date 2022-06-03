const {EmbedBuilder} = require('discord.js');
const { exec } = require("child_process");
const { DEBUG_SERVER } = new (require('../../modules/guntherUtils'))();
const { registerCommandsFromBot } = require("../../modules/slashRegister");

module.exports = {
    name: "restart",
    description: "Restarts the core of Gunther",
    hidden: true,
    availableInGuild: [ DEBUG_SERVER ],
    args: [{
        "name": "type",
        "description": "Type of restart to trigger",
        "type": 3,
        "required": false,
        "choices": [
            {name: "Full restart", value: "full"},
            {name: "Bot restart", value: "discord"},
            {name: "Simple restart", value: "simple"},
            {name: "Refresh commands", value: "commandreset"},
            {name: "Clear commands", value: "commanddelete"},
        ]
    }, {
        "name": "guildid",
        "description": "ID of the GUILD (or \"all\", can be comma separated)",
        "type": 3,
        "required": false
    }],
    async execute(ctx, client) {
        let authorize = false;
        if (client.owners.length == 0) { authorize = true } else { if (client.owners.includes(ctx.user.id)) { authorize = true } }
        if (!authorize) return ctx.reply({embeds: [this.baseEmbed('🛑 | You don\'t have permission to run this command')]});

        const restartMessage = function(text) {return `⏳ | **${text}...**\nCheck Gunther's status from Discord users panel`;}
        const restart = function(type) {
            type = type || false;

            client.user.setPresence({ activities: [{name: `The Great Restart`}], status: 'dnd', afk: true });
            if (type == "full") {
                ctx.editReply({embeds: [baseEmbed(restartMessage("Restarting Gunther's Lavalink server"))]}).then(msg => {
                    exec("pm2 restart lavalink");
                    setTimeout(function() {
                        ctx.editReply({embeds: [baseEmbed(restartMessage("Restarting Gunther's bot server"))]}).then(msg => {
                            setTimeout(function(){exec("pm2 restart gunther");}, 3000);
                        });
                    }, 2000);
                });
            } else if (type == "discord") {
                ctx.editReply({embeds: [this.baseEmbed(restartMessage("Restarting Gunther's bot server"))]}).then(msg => {
                    exec("pm2 restart gunther");
                });
            }
        }
        baseEmbed = this.baseEmbed
        restart.bind(baseEmbed, client)

        let commandGuildId = ctx.options.getString("guildid");
        if (commandGuildId == "all") { commandGuildId = ["all"]; }
        else if (commandGuildId) {
            commandGuildId = commandGuildId.split(",");
            commandGuildId.forEach((guild, index) => {
                guild = guild ? guild.trim() : ""; commandGuildId[index] = guild;
                if (!guild.match(new RegExp("^[0-9]*$", "gi"))) commandGuildId.splice(index, 1)
                if (!client.guilds.cache.has(guild)) commandGuildId.splice(index, 1)
            });
            commandGuildId = [...new Set(commandGuildId)].filter(n => n);
        } else { commandGuildId = [] }

        const player = client.player.players.get(ctx.guildId);
        await ctx.deferReply({ ephemeral: true });
        if (ctx.options.getString("type") == "full" || ctx.options.getString("type") == "discord") {
            restart(ctx.options.getString("type"));
        } else if (ctx.options.getString("type") == "commandreset" || ctx.options.getString("type") == "commanddelete") {
            if (commandGuildId.length <= 0) return ctx.editReply({embeds: [this.baseEmbed('❌ | You didn\'t provided any GUILD ID or the `all` option')]});

            if (commandGuildId[0] == "all") {
                if (ctx.options.getString("type") == "commandreset") {
                    await ctx.editReply({embeds: [this.baseEmbed("⏳ | Refreshing Gunther's slash commands in all servers, please wait...")]});
                    await registerCommandsFromBot(client);
                    return ctx.editReply({embeds: [this.baseEmbed('✅ | Commands refreshed in all servers')]});
                } else if (ctx.options.getString("type") == "commanddelete") {
                    await ctx.editReply({embeds: [this.baseEmbed("⏳ | Clearing Gunther's slash commands in all servers but debug server, please wait...")]});
                    await client.application.commands.set([]);
                    await Promise.all(client.guilds.cache.map(async (guild) => {
                        try {
                            if (guild.id != DEBUG_SERVER) await guild.commands.set([]);
                        } catch (e) {}
                    }));
                    return ctx.editReply({embeds: [this.baseEmbed('✅ | Cleared commands in all servers but debug server')]});
                }
            } else {
                if (ctx.options.getString("type") == "commandreset") {
                    await ctx.editReply({embeds: [this.baseEmbed("⏳ | Refreshing Gunther's slash commands in the specified servers, please wait...")]});
                    await Promise.all(commandGuildId.map(async (guildid) => {
                        try {
                            guild = await client.guilds.fetch(guildid);
                            await registerCommandsFromBot(client, guild);
                        } catch (e) {}
                    }));
                    return ctx.editReply({embeds: [this.baseEmbed('✅ | Commands refreshed in all the specified servers')]});
                } else if (ctx.options.getString("type") == "commanddelete") {
                    await ctx.editReply({embeds: [this.baseEmbed("⏳ | Clearing Gunther's slash commands in all the specified servers but debug server, please wait...")]});
                    await client.application.commands.set([]);
                    await Promise.all(commandGuildId.map(async (guildid) => {
                        try {
                            guild = await client.guilds.fetch(guildid);
                            if (guild.id != DEBUG_SERVER) await guild.commands.set([]);
                        } catch (e) {}
                    }));
                    return ctx.editReply({embeds: [this.baseEmbed('✅ | Cleared commands in all the specified servers but debug server')]});
                }
            }
        } else if (ctx.options.getString("type") == "simple" && player) {
            player.destroy()
            client.setClientPresence("ready");
        } else {
            return ctx.editReply({embeds: [this.baseEmbed('❌ | There is no active player to perform the simple restart')]});
        }
    }
}