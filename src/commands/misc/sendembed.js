const {EmbedBuilder} = require('discord.js');
const { DEBUG_SERVER } = new (require('../../modules/guntherUtils'))();

module.exports = {
    name: "sendembed",
    description: "Sends a embed (message) to one or all the servers Gunther is in",
    hidden: true,
    availableInGuild: [ DEBUG_SERVER ],
    args: [{
        "name": "guildid",
        "description": "ID of the GUILD (or \"all\", can be comma separated)",
        "type": 3,
        "required": true
    }, {
        "name": "title",
        "description": "Title of the embed",
        "type": 3,
        "required": true
    }, {
        "name": "description",
        "description": "Description of the embed",
        "type": 3,
        "required": true
    }, {
        "name": "color",
        "description": "Color of the embed",
        "type": 3,
        "required": false
    }, {
        "name": "authorname",
        "description": "Name of the author",
        "type": 3,
        "required": false
    }, {
        "name": "authorurl",
        "description": "URL of the author",
        "type": 3,
        "required": false
    }, {
        "name": "authorimageurl",
        "description": "Image to add to the author",
        "type": 3,
        "required": false
    }, {
        "name": "thumbnailurl",
        "description": "URL of the thumbnail",
        "type": 3,
        "required": false
    }, {
        "name": "imageurl",
        "description": "URL of the image",
        "type": 3,
        "required": false
    }, {
        "name": "footertext",
        "description": "Text to add to the footer",
        "type": 3,
        "required": false
    }, {
        "name": "footerimageurl",
        "description": "Image to add to the footer",
        "type": 3,
        "required": false
    }, {
        "name": "settimestamp",
        "description": "Add date to the footer",
        "type": 5,
        "required": false
    }, {
        "name": "preview",
        "description": "Test the embed before sending (default is true)",
        "type": 5,
        "required": false
    }],
    async execute(ctx, client) {
        let authorize = false;
        if (client.owners.length == 0) { authorize = true } else { if (client.owners.includes(ctx.user.id)) { authorize = true } }
        if (!authorize) return ctx.reply({embeds: [this.baseEmbed('🛑 | You don\'t have permission to run this command')]});

        await ctx.deferReply({ ephemeral: true });
        try {
            embedData = {}
            client.commands.get("sendembed").args.forEach(arg => {embedData[arg.name] = (arg.type == 5 ? (ctx.options.getBoolean(arg.name)) : ctx.options.getString(arg.name))});
            embedData.color = embedData.color ? embedData.color : client.EMBED_COLOR();
            embedData.settimestamp = embedData.settimestamp ? embedData.settimestamp : false;
            embedData.preview = embedData.preview == null ? true : embedData.preview;
            embedData.authorurl = embedData.authorurl ? (client.isValidHttpUrl(embedData.authorurl) ? embedData.authorurl : null) : null;
            if (embedData.authorimageurl) {
                if (embedData.authorimageurl.split("icon ")[0] == "") embedData.authorimageurl = client.assetsURL_icons+"/"+embedData.authorimageurl.split("icon")[1].trim()+".png?color="+embedData.color.replace("#", "")
                else embedData.authorimageurl = embedData.authorimageurl ? (client.isValidHttpUrl(embedData.authorimageurl) ? embedData.authorimageurl : null) : null;
            }
            embedData.thumbnailurl = embedData.thumbnailurl ? (client.isValidHttpUrl(embedData.thumbnailurl) ? embedData.thumbnailurl : null) : null;
            embedData.imageurl = embedData.imageurl ? (client.isValidHttpUrl(embedData.imageurl) ? embedData.imageurl : null) : null;
            embedData.footerimageurl = embedData.footerimageurl ? (client.isValidHttpUrl(embedData.footerimageurl) ? embedData.footerimageurl : null) : null;

            if (embedData.guildid == "all") {
                embedData.guildid = [];
                client.guilds.cache.map((guild, index) => {
                    embedData.guildid.push(guild.id);
                })
            } else {
                embedData.guildid = embedData.guildid.split(",");
                embedData.guildid.forEach((guild, index) => {
                    guild = guild.trim(); embedData.guildid[index] = guild;
                    if (!guild.match(new RegExp("^[0-9]*$", "gi"))) embedData.guildid.splice(index, 1)
                    if (!client.guilds.cache.has(guild)) embedData.guildid.splice(index, 1)
                });
                embedData.guildid = [...new Set(embedData.guildid)];
            }

            const embed = new EmbedBuilder()
                .setTitle(embedData.title)
                .setDescription(embedData.description)
                .setColor(embedData.color)

            if (embedData.authorname) {
                let authordata = {name: embedData.authorname};
                if (embedData.authorimageurl) authordata.iconURL = embedData.authorimageurl;
                if (embedData.authorurl) authordata.url = embedData.authorurl;
                embed.setAuthor(authordata);
            }

            if (embedData.thumbnailurl) embed.setThumbnail(embedData.thumbnailurl);
            if (embedData.imageurl) embed.setImage(embedData.imageurl);
            if (embedData.settimestamp) embed.setTimestamp()

            if (embedData.footertext) {
                let footerdata = {text: embedData.footertext};
                if (embedData.footerimageurl) footerdata.iconURL = embedData.footerimageurl;
                embed.setFooter(footerdata);
            }

            if (embedData.preview) {
                ctx.editReply({embeds: [this.baseEmbed('ℹ️ | You are seeing a preview of your embed, set the `preview` option `false` to send it for real.'), embed]});
            } else {
                let embedsSent = 0;
                await Promise.all(embedData.guildid.map(async (guild) => {
                    guild = await client.guilds.fetch(guild);
                    defaultChannel = ""
                    guild.channels.cache.forEach(channel => {
                        if(channel.type == 0 && defaultChannel == "") {
                            if (channel.permissionsFor(guild.members.me).has(["SendMessages"])) { defaultChannel = channel; }
                        }
                    });
                    if (defaultChannel == "") return false;

                    await defaultChannel.send({embeds: [embed]});
                    embedsSent++;
                }));

                ctx.editReply({embeds: [this.baseEmbed(`✅ | Successfuly sent ${embedsSent} embeds`)]});
            }
        } catch (err) {
            //console.log(err, "hm?")
            const embed = new EmbedBuilder()
                .setTitle('💣 | Execution failed (eval)')
                .setDescription(`\`\`\`js` + '\n' + err + `\n` + `\`\`\``)
                .setColor(0xff0000)
            ctx.editReply({embeds: [embed]})
        }
    }
}