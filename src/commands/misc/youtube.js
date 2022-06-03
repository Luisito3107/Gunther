const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: "youtube",
    description: "Starts a YouTube Together session",
    args: [],
    async execute(ctx, client) {
        await ctx.deferReply();
        if(ctx.member.voice.channel) {
            client.discordTogether.createTogetherCode(ctx.member.voice.channel.id, 'youtube').then(async invite => {
                const embed = new EmbedBuilder()
                    .setAuthor({name: "YouTube Together", iconURL: client.assetsURL_icons+"/youtube.png?color=E53935"})
                    .setDescription(
                        `Using **YouTube Together** you can watch YouTube with your friends in a voice channel. Click *Join YouTube Together* to join in!\n\n`+
                        `__**[Join YouTube Together](${invite.code})**__`
                    )
                    .setFooter({text: "Note: this only works in desktop"})
                    .setColor("E53935");
                ctx.editReply({embeds: [embed]})
            });
        };
    }
}