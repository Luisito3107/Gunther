module.exports = {
    name: 'clear',
    description: 'Clear the queue',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        player.queue.clear(); 

        ctx.reply({embeds: [this.baseEmbed(`✅ | Cleared the queue`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}