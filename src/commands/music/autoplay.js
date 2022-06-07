module.exports = {
    name: 'autoplay',
    description: 'Play a mix of similar songs when the current track queue ends',
    args: [{
        "name": "value",
        "description": "Enabled or disabled",
        "type": 5,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        let status;

        if (player) {
            //if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
            if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
            if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
            //if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

            status = (ctx.options.getBoolean("value") == null ? !player.autoplayOnQueueEnd : ctx.options.getBoolean("value"));
            player.setAutoPlayOnQueueEnd(status);
        } else {
            status = (ctx.options.getBoolean("value") == null ? !(client.guildOptions[ctx.guildId] ? client.guildOptions[ctx.guildId].autoplayOnQueueEnd : false) : ctx.options.getBoolean("value"));
        }

        if (client.guildOptions[ctx.guildId]) client.guildOptions[ctx.guildId].autoplayOnQueueEnd = status;

        ctx.reply({embeds: [this.baseEmbed(`✅ | Autoplay ${status ? "enabled" : "disabled"}`)]});
        return client.playerHandler.saveGuildOptions(null, client.guildOptions[ctx.guildId], ctx.guildId);
    }
}