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

/*const {Intents} = require("discord.js");

module.exports = {
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
}*/