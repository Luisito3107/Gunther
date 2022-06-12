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
            if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
            if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        }

        status = (ctx.options.getBoolean("value") == null ? !(client.guildOptions[ctx.guildId] ? client.guildOptions[ctx.guildId].autoplayOnQueueEnd : true) : ctx.options.getBoolean("value"));

        client.guildOptions[ctx.guildId] = client.guildOptions[ctx.guildId] || {};
        client.guildOptions[ctx.guildId].autoplayOnQueueEnd = status;

        ctx.reply({embeds: [this.baseEmbed(`✅ | Autoplay ${status ? "enabled" : "disabled"}`)]});
        return client.guildOptionsHandler.saveGuildOptions(ctx.guildId, client.guildOptions[ctx.guildId]);
    }
}