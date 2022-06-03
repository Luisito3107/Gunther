module.exports = {
    name: 'remove',
    description: 'Remove song from the queue',
    args: [{
        "name": "position",
        "description": "Song position in the queue",
        "type": 4,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        let position = ctx.options.getInteger("position");
        if (player.queue.size == 0) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | There are no more tracks in the queue`)]});
        if (position > player.queue.size) return ctx.reply({embeds: [this.baseEmbed(`❌ | The queue only has \`${player.queue.size}\` song${player.queue.size > 1 ? 's' : ''}`)]});

        const targetSong = player.queue[position - 1]
        player.queue.remove((parseInt(position)) - 1)

        ctx.reply({embeds: [this.baseEmbed(`✅ | Removed [${targetSong?.title}](${targetSong?.uri}) from the queue`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}