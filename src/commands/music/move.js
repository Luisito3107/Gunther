module.exports = {
    name: 'move',
    description: 'Move a song in the queue',
    args: [{
        "name": "from",
        "description": "Song current position in the queue",
        "type": 4,
        "required": true
    }, {
        "name": "to",
        "description": "Song target position in the queue",
        "type": 4,
        "required": false
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});


        let from = ctx.options.getInteger("from"), to = ctx.options.getInteger("to");

        const {e, m} = await player.move(from, to).catch(e => ({e: true, m: e}));

        if (e) ctx.reply({embeds: [this.baseEmbed("💣 | Oops, an error occoured! Please try again in a few minutes.\n" + `\`\`\`${m ? m : 'No error was provided'}\`\`\``)], ephemeral: true});
        ctx.reply({embeds: [this.baseEmbed(`✅ | Song moved`)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}