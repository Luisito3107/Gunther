const guildOptions = require('../schemas/guildOptions');
const chalk = require("chalk");

module.exports = class GuntherGuildOptionsHandler {
    constructor(client) {
        this.client = client;
    }

    async fetchGuildOptions() {
        if (this.client.database === undefined) return setTimeout(() => this.fetchGuildOptions(), 1000)
        if (!this.client.database) return;
        console.log(chalk.yellow(`[GUILD OPTIONS] => Collecting guild specific options`))
        const queues = await guildOptions.find()
        console.log(chalk.greenBright(`[GUILD OPTIONS] => Found ${queues.length ? `${queues.length} guild${queues.length > 1 ? 's' : ''}. Storing all options in client` : '0 guilds'}`))
        if (!queues.length) return;
        for (let data of queues) {
            if (data.guildID) this.client.guildOptions[data.guildID] = {
                autoplayOnQueueEnd: data.autoplayOnQueueEnd || false
            }
        }
        return true
    }

    async saveGuildOptions(guildId, options) {
        if (!this.client.database) return;

        options = {
            guildID: guildId,
            autoplayOnQueueEnd: options.autoplayOnQueueEnd
        }

        const data = await guildOptions.findOne({guildID: guildId})

        if (!data) {
            const newData = new guildOptions(options)
            return await newData.save()
        } else {
            return guildOptions.findOneAndUpdate({guildID: guildId}, options);
        }
    }
}