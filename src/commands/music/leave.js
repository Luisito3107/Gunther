module.exports = {
    name: 'leave',
    description: 'Make the bot leave your voice channel',
    aliases: ["stop"],
    args: [],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});

        player.destroy();
        client.setClientPresence("ready");

        ctx.reply({embeds: [this.baseEmbed(`👌 | Left your voice channel`)]});
        return client.playerHandler.delete(client.player.players.get(ctx.guildId));
    }
}