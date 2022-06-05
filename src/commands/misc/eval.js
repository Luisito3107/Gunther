const {EmbedBuilder} = require('discord.js');
const {inspect} = require("util");
const Pagination = require("../../modules/Pagination");

module.exports = {
    name: "eval",
    description: "Evaluate a code snippet",
    args: [{
        "name": "code",
        "description": "Code to execute",
        "type": 3,
        "required": true
    }],
    hidden: true,
    async execute(ctx, client) {
        let authorize = false;
        if (client.owners.length == 0) { authorize = true } else { if (client.owners.includes(ctx.user.id)) { authorize = true } }
        if (!authorize) return ctx.reply({embeds: [this.baseEmbed('🛑 | You don\'t have permission to run this command')]});
        let code = ctx.options.getString("code");

        await ctx.deferReply();
        try {
            let evalResult = eval(code);
            let type = evalResult
            if (typeof evalResult !== "string") evalResult = inspect(evalResult);

            let EMBED_COLOR = client.EMBED_COLOR();
            let embeds = this.chunkSubstr(String(evalResult), 2000).map((s, i) => new EmbedBuilder()
                .setTitle('Result')
                .setAuthor({name: "Execution result (eval)", iconURL: client.assetsURL_icons+"/eval.png?color="+EMBED_COLOR.replace("#", "")})
                .setDescription(`\`\`\`js` + '\n' + s + `\n` + `\`\`\``)
                .setColor(EMBED_COLOR)
                .setFooter({text: `Type: ${typeof type} | Time: ${new Date() - ctx.createdTimestamp}ms | Page ${i + 1} / ${this.chunkSubstr(String(evalResult), 2000).length}`})
            )
            return new Pagination(ctx, embeds, 120 * 1000).start();
        } catch (err) {
            console.log(err, "hm?")
            const embed = new EmbedBuilder()
                .setTitle('💣 | Execution failed (eval)')
                .setDescription(`\`\`\`js` + '\n' + err + `\n` + `\`\`\``)
                .setColor(0xff0000)
            ctx.editReply({embeds: [embed]})
        }
    }
}