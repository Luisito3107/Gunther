module.exports = {
    name: 'pause',
    description: 'Toggles player\'s pause',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        //if (player.paused) ctx.reply({embeds: [this.baseEmbed(`The player is already paused.`)]});

        player.pause(!player.paused);
        return ctx.reply({embeds: [this.baseEmbed(`${player.paused ? "⏸️ | Player is now paused" : "▶️ | Player resumed"}`)]});
    }
}