const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'filters',
    description: 'Get all filters status, set or reset them',
    args: [{
        "name": "set",
        "description": "Set the value of a specific filter",
        "type": 2,
        "required": false,
        "options": [
            {
                "name": "speed", "description": "Set player speed", "type": 1,
                "options": [{"name": "value", "description": "Number between 0.1 and 5", "type": 10, "required": true, "min_value": 0.1, "max_value": 5}]
            }, {
                "name": "pitch", "description": "Set player pitch", "type": 1,
                "options": [{"name": "value", "description": "Number between 0.1 and 5", "type": 10, "required": true, "min_value": 0.1, "max_value": 5}]
            }, {
                "name": "bassboost", "description": "Set player bass boost", "type": 1,
                "options": [{"name": "value", "description": "Number between 0 and 100", "type": 4, "required": true, "min_value": 0, "max_value": 100}]
            }, {
                "name": "nightcore", "description": "Set player nightcore filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "8d", "description": "Set player 8D filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "vaporwave", "description": "Set player vaporwave filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "karaoke", "description": "Set player karaoke filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "pop", "description": "Set player pop filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "soft", "description": "Set player soft filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "treblebass", "description": "Set player treblebass filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "vibrato", "description": "Set player vibrato filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }, {
                "name": "tremolo", "description": "Set player tremolo filter", "type": 1,
                "options": [{"name": "value", "description": "Enabled or disabled", "type": 5, "required": true}]
            }
        ]
    }, {
        "name": "reset",
        "description": "Reset all the filters",
        "type": 1,
        "required": false
    }, {
        "name": "all",
        "description": "Get status of all the filters",
        "type": 1,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});


        let EMBED_COLOR = client.EMBED_COLOR();
        const embed = new EmbedBuilder().setColor(EMBED_COLOR)

        const subcommand = ctx.options.getSubcommand(false);
        let status, newvalue = ""
        switch (subcommand) {
            case "speed":
                newvalue = ctx.options.getNumber("value");
                player.setSpeed(newvalue);
                embed.setDescription(`🎶 | Player speed is now ${newvalue}x`);
                break;
            case "pitch":
                newvalue = ctx.options.getNumber("value");
                player.setPitch(newvalue);
                embed.setDescription(`🎶 | Player pitch is now ${newvalue}x`);
                break;
            case "bassboost":
                newvalue = ctx.options.getInteger("value");
                newvalue = newvalue ? ctx.options.getInteger("value") : false;
                player.setBassboost(newvalue);
                embed.setDescription(`🎶 | Bass boost filter is now ${newvalue ? `at ${newvalue}%` : "disabled"}`);
                break;
            case "nightcore":
                newvalue = ctx.options.getBoolean("value");
                player.setNightcore(newvalue);
                embed.setDescription(`🎶 | Nightcore filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "8d":
                newvalue = ctx.options.getBoolean("value");
                player.set8D(newvalue);
                embed.setDescription(`🎶 | 8D filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "vaporwave":
                newvalue = ctx.options.getBoolean("value");
                player.setVaporwave(newvalue);
                embed.setDescription(`🎶 | Vaporwave filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "karaoke":
                newvalue = ctx.options.getBoolean("value");
                player.setKaraoke(newvalue);
                embed.setDescription(`🎤 | Karaoke filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "pop":
                newvalue = ctx.options.getBoolean("value");
                player.setPop(newvalue);
                embed.setDescription(`🎶 | Pop filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "soft":
                newvalue = ctx.options.getBoolean("value");
                player.setSoft(newvalue);
                embed.setDescription(`🎶 | Soft filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "treblebass":
                newvalue = ctx.options.getBoolean("value");
                player.setTreblebass(newvalue);
                embed.setDescription(`🎶 | Treblebass filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "vibrato":
                newvalue = ctx.options.getBoolean("value");
                player.setVibrato(newvalue);
                embed.setDescription(`🎶 | Vibrato filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "tremolo":
                newvalue = ctx.options.getBoolean("value");
                player.setTremolo(newvalue);
                embed.setDescription(`🎶 | Tremolo filter is now ${newvalue ? "enabled" : "disabled"}`);
                break;
            case "reset":
                player.clearEffects();
                embed.setDescription("👌 | Filters reset");
                break;
            case "all":
                embed.setAuthor({name: `Filters`, iconURL: client.assetsURL_icons+"/filters.png?color="+EMBED_COLOR.replace("#", "")})
                    .setFields([
                        {name: "Speed", value: `${Math.round(player.speed * 100) / 100}x`, inline: true},
                        {name: "Pitch", value: `${Math.round(player.pitch * 100) / 100}x`, inline: true},
                        {name: "Bassboost", value: `${player.bassboost ? `${player.bassboost * 100}%` : 'Disabled'}`, inline: true},
                        {name: "Karaoke", value: `${player.karaoke ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "8D", value: `${player._8d ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Nightcore", value: `${player.nightcore ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Vaporwave", value: `${player.vaporwave ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Pop", value: `${player.pop ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Soft", value: `${player.soft ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Treblebass", value: `${player.treblebass ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Vibrato", value: `${player.vibrato ? 'Enabled' : 'Disabled'}`, inline: true},
                        {name: "Tremolo", value: `${player.tremolo ? 'Enabled' : 'Disabled'}`, inline: true},
                    ])
                    .setFooter({text: "Set an specific filter with /filters set"})
                break;
        }

        ctx.reply({embeds: [embed]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}