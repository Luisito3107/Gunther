module.exports = {
    name: 'previous',
    description: 'Play previous song',
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        const currentSong = player.queue.current;
        player.play(player.queue.previous);
        if (currentSong) player.queue.unshift(currentSong);

        return ctx.reply({embeds: [this.baseEmbed(`⏮️ | Playing the previous song`)]});
    }
}