const {GatewayIntentBits} = require("discord.js");
const {
    Guilds,
    GuildVoiceStates,
    GuildMessages,
    GuildMessageReactions,
    MessageContent
} = GatewayIntentBits;

module.exports = {
    intents: [Guilds, GuildVoiceStates, GuildMessages, GuildMessageReactions, MessageContent]
}