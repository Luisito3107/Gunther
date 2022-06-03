module.exports = {
    name: 'shuffle',
    description: 'Shuffle the songs in the queue',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.length) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | There are no more tracks in the queue`)]});

        player.queue.shuffle();

        ctx.reply({embeds: [this.baseEmbed(`🔀 | Shuffled the queue`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}