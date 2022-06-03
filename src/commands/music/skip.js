module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    args: [],
    aliases: ["next"],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (player.queue.size <= 0) {
            player.stop()
            client.setClientPresence("ready");
        } else {
            //if (!player.queue.length) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | There are no more tracks in the queue`)]});
                const {e, m} = await player.skip().catch(_ => ({e: true, m: _}));
            if (e) ctx.reply({embeds: [this.baseEmbed("💣 | Oops, an error occurred! Please try again in a few minutes.\n" + `\`\`\`${m ? m : 'No error was provided'}\`\`\``)]});
        }
        return ctx.reply({embeds: [this.baseEmbed(`⏭️ | Skipped current song`)]});
    }
}