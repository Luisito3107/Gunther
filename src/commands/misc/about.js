const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: "about",
    description: "See a description about this project",
    args: [],
    async execute(ctx, client) {
        let EMBED_COLOR = client.EMBED_COLOR();
        ctx.reply({embeds: [new EmbedBuilder()
            .setThumbnail('https://static.wikia.nocookie.net/adventuretimewithfinnandjake/images/6/67/S4e2_gunter%27s_keyboard.png')
            .setAuthor({name: "Information about Gunther", iconURL: client.assetsURL_icons+"/info.png?color="+EMBED_COLOR.replace("#", "")})
            .setColor(EMBED_COLOR)
            .setFields([
                { name: "Created by", value: '<@546441136479404052>', inline: true },
                { name: "Libraries used", value: '[discord.js](https://discord.js.org/), [erela.js](https://github.com/MenuDocs/erela.js), [lavasfy](https://github.com/Allvaa/lava-spotify), [genius-lyrics](https://genius-lyrics.js.org/) and more...', inline: true },
                { name: "Registered services", value: '[Genius API](https://genius.com/developers)\n[Spotify Web API](https://developer.spotify.com/documentation/web-api/)\n[MongoDB Atlas](https://www.mongodb.com/atlas/database)', inline: true },
                { name: "\u200b", value: `Using [Laffey](https://github.com/Weeb-Devs/Laffey) bot from [Weeb-Devs](https://github.com/Weeb-Devs) as a canvas, Gunther bot was bot created as a replacement for the beloved Groovy bot for the servers I have with my friends, but with some extra goodies such as better lyrics and interface, YouTube~Discord watch parties and a lot of audio filters (effects).`+
                `\nThis bot was created in memory of [James Michael Tyler](https://en.wikipedia.org/wiki/James_Michael_Tyler), who played the role of [Gunther](https://friends.fandom.com/wiki/Gunther) on the sitcom [Friends](https://en.wikipedia.org/wiki/Friends) (my favorite show) and passed away from cancer in October 2021. However, for versatility this bot uses images of Gunter, the penguin that always accompanies the Ice King in Adventure Time.\n\u200b`, inline: false },
                { name: "Repository", value: `Gunther is now open source, and it's available at [Github](https://github.com/Luisito3107/Gunther).`, inline: false }
            ])
        ]})
    }
}