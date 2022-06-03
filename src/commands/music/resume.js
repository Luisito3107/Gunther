module.exports = {
    name: 'resume',
    description: 'Resume the player',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        
        if (!player.paused) return ctx.reply({embeds: [this.baseEmbed(`▶️ | Player was not paused`)]});
        player.pause(false);

        ctx.reply({embeds: [this.baseEmbed(`▶️ | Player resumed`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}