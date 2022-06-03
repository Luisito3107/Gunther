module.exports = {
    name: 'join',
    description: 'Make the bot join your voice channel',
    args: [],
    async execute(ctx, client) {
        let player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (!channel.permissionsFor(client.user).has(["Connect", "Speak"])) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | I don't have \`Connect\` and \`Speak\` permissions in your channel`)]});

        if (!player || (player && !player.voiceChannel)) {
            player = client.player.create({
                guild: ctx.guildId,
                voiceChannel: channel.id,
                textChannel: ctx.channel.id,
                selfDeafen: true
            });
            player.connect()
            return ctx.reply({embeds: [this.baseEmbed(`👌 | Joined your voice channel`)]});
        }
        return ctx.reply({embeds: [this.baseEmbed(`⚠️ | I\'m already playing music on another voice channel`)]});
    }
}