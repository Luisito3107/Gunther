const { _24H_COMMAND_ENABLED } = new (require('../../modules/guntherUtils'))();

module.exports = {
    name: '24h',
    description: 'Make the bot stay in the voice channel even if there is no queue left',
    args: [{
        "name": "value",
        "description": "Enabled or disabled",
        "type": 5,
        "required": false
    }],
    enabled: _24H_COMMAND_ENABLED,
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        //if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        const status = (ctx.options.getBoolean("value") == null ? !player.get("24h")?.status : ctx.options.getBoolean("value"));
        player.set("24h", {status: status});

        ctx.reply({embeds: [this.baseEmbed(`✅ | 24H mode ${status ? "enabled" : "disabled"}`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}