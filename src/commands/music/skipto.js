module.exports = {
    name: 'skipto',
    description: 'Skip to a specific song',
    args: [{
        "name": "position",
        "description": "Desired song position in queue",
        "type": 4,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.length) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | There are no more tracks in the queue`)]});

        let position = ctx.options.getInteger("position");
        if (position > player.queue.size) return ctx.reply({embeds: [this.baseEmbed(`❌ | The queue only has \`${player.queue.size}\` song${player.queue.size > 1 ? 's' : ''}`)]});

        const {e, m} = await player.skipto(position).catch(_ => ({e: true, m: _}));
        if (e) return ctx.reply({embeds: [this.baseEmbed("💣 | Oops, an error occoured! Please try again in a few minutes.\n" + `\`\`\`${m ? m : 'No error was provided'}\`\`\``)], ephemeral: true});

        return ctx.reply({embeds: [this.baseEmbed(`⏭️ | Skipped to a specific song`)]});
    }
}