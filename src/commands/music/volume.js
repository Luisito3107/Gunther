module.exports = {
    name: 'volume',
    description: 'Set/reset the volume of the player',
    args: [{
        "name": "set",
        "description": "Set the volume of the player",
        "type": 1,
        "required": false,
        "options": [{
            "name": "value",
            "description": "The new value for the volume (number between 0 and 200)",
            "type": 4,
            "required": true,
            "min_value": 0,
            "max_value": 200
        }]
    }, {
        "name": "reset",
        "description": "Reset the player volume",
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

        let amount = "";
        const subcommand = ctx.options.getSubcommand(false);
        if (subcommand == "reset") { amount = 100; }
        else { amount = ctx.options.getInteger("value"); }
        player.setVolume(parseInt(amount));
        ctx.reply({embeds: [this.baseEmbed(`🔊 | Volume set to ${amount}%`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}