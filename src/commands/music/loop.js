module.exports = {
    name: 'loop',
    description: 'Loop the player',
    args: [{
        "name": "value",
        "description": "What do you want to loop?",
        "type": 3,
        "required": false,
        "choices": [
            {name: "This track only", value: "track"},
            {name: "Whole queue", value: "queue"},
            {name: "None (disable)", value: "none"},
        ]
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        let status;
        if (ctx.options.getString("value") == null) status = player.toggleLoop()?.status;
        else {
            status = ctx.options.getString("value");
            switch(status) {
                case "queue": player.setTrackRepeat(false); player.setQueueRepeat(true); break;
                case "track": player.setQueueRepeat(false); player.setTrackRepeat(true); break;
                default: player.setTrackRepeat(false); player.setQueueRepeat(false); break;
            }
        }

        let text = "";
        switch(status) {
            case "queue": text = "🔁 | Now looping whole queue"; break;
            case "track": text = "🔂 | Now looping current track"; break;
            default: text = "➡ | Looping disabled"; break;
        }        

        ctx.reply({embeds: [this.baseEmbed(text)]});
        return client.playerHandler.savePlayer(client.player.players.get(ctx.guildId));
    }
}