const {EmbedBuilder, ButtonStyle} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder} = require("@discordjs/builders");

module.exports = {
    name: "invite",
    description: "Gives you a link to invite this bot to other servers",
    args: [],
    async execute(ctx, client) {
        let authorize = false;
        if (client.owners.length == 0) { authorize = true } else { if (client.owners.includes(ctx.user.id)) { authorize = true } }
        if (!authorize) return ctx.reply({embeds: [this.baseEmbed('🛑 | You don\'t have permission to run this command')]});

        let EMBED_COLOR = client.EMBED_COLOR();
        const embed = new EmbedBuilder()
            .setAuthor({name: "Invitation link", iconURL: client.assetsURL_icons+"/invite.png?color="+EMBED_COLOR.replace("#", "")})
            .setColor(EMBED_COLOR)
            .setDescription("Remember this bot will only join authorized servers.")

        let link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=bot%20applications.commands`
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(link).setLabel("Invite bot")
        )
        return ctx.reply({embeds: [embed], components: [row]});
    }
}