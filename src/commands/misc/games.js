const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: "games",
    description: "Create a session to play a game with your friends",
    args: [{
        "name": "game",
        "description": "Name of the game to start",
        "type": 3,
        "required": true,
        "choices": [
            {name: "Poker night", value: "poker"},
            {name: "Chess in the Park", value: "chess"},
            {name: "Checkers in the Park", value: "checkers"},
            {name: "Betrayal.io", value: "betrayal"},
            {name: "Fishington.io", value: "fishing"},
            {name: "Letter Title", value: "lettertile"},
            {name: "Word Snacks", value: "wordsnack"},
            {name: "Doodle Crew", value: "doodlecrew"},
            {name: "Spellcast", value: "spellcast"},
            {name: "Awkword", value: "awkword"},
            {name: "Putt Party", value: "puttparty"},
            {name: "Sketch Heads", value: "sketchheads"},
            {name: "Ocho", value: "ocho"},
        ]
    }],
    async execute(ctx, client) {
        await ctx.deferReply();
        let game = ctx.options.getString("game");
        switch (game) {
            case "poker": game = {name: "Poker night", image: "https://i.ibb.co/4PcrL0K/Poker.png"}; break;
            case "betrayal": game = {name: "Betrayal.io", image: "https://i.ibb.co/HdGHVyv/Betrayal.png"}; break;
            case "fishing": game = {name: "Fishington.io", image: "https://i.ibb.co/5vzp1XF/Fishing.png"}; break;
            case "chess": game = {name: "Chess in the Park", image: "https://i.ibb.co/r2yHYz9/Chess.png"}; break;
            case "checkers": game = {name: "Checkers in the Park", image: "https://i.ibb.co/r2yHYz9/Chess.png"}; break;
            case "lettertile": game = {name: "Letter Tile", image: "https://i.ibb.co/CQHPRFP/Letter-Tile.png"}; break;
            case "wordsnack": game = {name: "Word Snacks", image: "https://i.ibb.co/QJMS1yR/Word-Snacks.png"}; break;
            case "doodlecrew": game = {name: "Doodle Crew", image: "https://i.ibb.co/f2pKrGt/Doodle-Crew.png"}; break;
            case "awkword": game = {name: "Awkword", image: "https://i.ibb.co/4mZCXMW/Awkword.png"}; break;
            case "spellcast": game = {name: "Spellcast", image: "https://i.ibb.co/CHqBzcY/Spell-Cast.png"}; break;
            case "puttparty": game = {name: "Putt Party"}; break;
            case "sketchheads": game = {name: "Sketch Heads"}; break;
            case "ocho": game = {name: "Ocho"}; break;
            default: game = false; break;
        }
        if(ctx.member.voice.channel) {
            client.discordTogether.createTogetherCode(ctx.member.voice.channel.id, ctx.options.getString("game")).then(async invite => {
                let EMBED_COLOR = client.EMBED_COLOR();
                let embed = new EmbedBuilder()
                    .setAuthor({name: "Games", iconURL: client.assetsURL_icons+"/games.png?color="+EMBED_COLOR.replace("#", "")})
                    .setTitle(game.name)
                    .setColor(EMBED_COLOR)
                    .setDescription(
                        `You are about to play _${game.name}_ with your friends in a voice channel. Click *Join gaming session* to join in!\n\n`+
                        `__**[Join gaming session](${invite.code})**__`
                    )
                    .setImage(game.image ? game.image : null)
                    .setFooter({text: "Note: this only works in desktop"});

                ctx.editReply({embeds: [embed]})
            });
        };
    }
}