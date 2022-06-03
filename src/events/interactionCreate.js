const {EmbedBuilder} = require('discord.js');
const { EMBED_COLOR } = new (require('../modules/guntherUtils'))();

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(ctx, client) {
        if (!ctx.isCommand()) return;

        let command = ctx.commandName;
        command = client.commands.get(command);

        if (!command) return ctx.reply({embeds: [this.baseEmbed(`🚫 | That command is currently unavailable`)]});

        try {
            command.execute.bind(this)(ctx, client);
        } catch (e) {
            console.error(e);
            return ctx.reply({embeds: [this.baseEmbed(`💣 | Oops, an error occoured while executing **${command.name}**!\n\`\`\`${e ? e : 'No error was provided'}\`\`\``)]}).catch(_ => void 0);
        }
    },
    baseEmbed(content) {
        return new EmbedBuilder().setColor(EMBED_COLOR()).setDescription(content);
    },
    chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size)
        const chunks = new Array(numChunks)

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }

        return chunks
    },
    chunkArray(arr = [], size = 10) {
        let chunks = []
        for (let i = 0; i < arr.length; i += size) {
            const chunk = arr.slice(i, i + size);
            chunks.push(chunk);
        }
        return chunks;
    }
};