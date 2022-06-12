const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: "help",
    description: "Get information of all the available commands",
    args: [{
        "name": "command",
        "description": "Name of the command",
        "type": 3,
        "required": false
    }],
    async execute(ctx, client) {
        let EMBED_COLOR = client.EMBED_COLOR();
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)

        let commandArg = ctx.options.getString("command");
        if (commandArg) {
            commandArg = commandArg.toLowerCase().replace("/", "");
            let commandInfo = client.commands.get(commandArg);
            if (commandInfo) {
                let commandUsage = "", commandArguments = "", commandAliases = "";
                commandInfo.args.forEach(arg => {
                    commandUsage += (arg.required ? " < " : " [ ") + arg.name + (arg.required ? " >" : " ]")
                    commandArguments += `• **${arg.name}**${(!arg.required ? " *(optional)*" : "")}: ${arg.description}\n`;
                })
                if (Array.isArray(commandInfo.aliases)) {
                    commandInfo.aliases.forEach(alias => {
                        commandAliases += `/${alias}\n`
                    })
                }

                embed
                    .setAuthor({name: `Help: ${commandInfo.name}`, iconURL: client.assetsURL_icons+"/help.png?color="+EMBED_COLOR.replace("#", "")})
                    .setFields([
                        {name: "Description", value: `${commandInfo.description ? commandInfo.description : "This command has no description"}`, inline: false},
                        {name: "Arguments", value: (commandArguments ? commandArguments : "*None*"), inline: false},
                        {name: "Usage", value: `\`/${commandInfo.name}${commandUsage ? commandUsage : ""}\``, inline: true},
                        {name: "Aliases", value: `${commandAliases ? `\`${commandAliases}\`` : "*None*"}`, inline: true},
                    ])
            } else {
                embed.setDescription("❓ | That\'s not an available command!")
                return ctx.reply({embeds: [embed], ephemeral: true});
            }
        } else {
            let description = `You can trigger all the following commands starting your message with a slash (/)\n\n`;
            embed
                .setAuthor({name: "Help: all commands", iconURL: client.assetsURL_icons+"/help.png?color="+EMBED_COLOR.replace("#", "")})
                .setFooter({text: `Use /help [ command ] for more information about a specific command`});

            let categories = {};
            for (let c of [...client.commands.values()]) categories[`${c.category}`] ? categories[`${c.category}`].push(c) : categories[`${c.category}`] = [c];
            const bullets = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"];
            Object.keys(categories).forEach(category => {
                if (category == "aliases") return;

                let commandsInCategory = []; let commandsIndex = 0;
                categories[category].forEach(command => {
                    if (!command.hidden) {
                        let commandUsage = ""
                        command.args.forEach(arg => {commandUsage += (arg.required ? " < " : " [ ") + arg.name + (arg.required ? " >" : " ]")})
                        commandsInCategory.push(` ${bullets[commandsIndex % (bullets.length)]} \`/${command.name}${commandUsage ? commandUsage : ""}\` - ${command.description}`)
                        if (Array.isArray(command.aliases)) {
                            command.aliases.forEach(alias => {
                                commandsInCategory.push(`   \`• /${alias}\``);
                            })
                        } 
                        commandsIndex++;
                    }
                });

                let categoryTitle = category;
                switch(categoryTitle) {
                    case "misc": categoryTitle = "Tools and information"; break;
                    case "music": categoryTitle = "Player commands"; break;
                }

                description += `**${categoryTitle}**\n${commandsInCategory.join("\n")}\n\n`;
            });

            description += "\u200B";
            embed.setDescription(description);
        }

        return ctx.reply({embeds: [embed]});
    }
}