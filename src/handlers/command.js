const {readdirSync} = require('fs');
const {join} = require('path');
const { VALID_SERVERS } = new (require('../modules/guntherUtils'))();

function main() {
    this.logger.debug('COMMANDS', 'Loading commands')
    let notImportantCount = 0, aliasCount = 0;
    for (const x of readdirSync(join(__dirname, "..", "commands"))) {
        for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
            command = require(`../commands/${x}/${command}`)
            command.enabled = (command.enabled == undefined ? true : command.enabled);

            if (command.enabled) {
                if (!command.availableInGuild) command.availableInGuild = VALID_SERVERS;
                command.availableInGuild = Array.isArray(command.availableInGuild) ? command.availableInGuild : [];
                command.availableInGuild.forEach((guild, index) => {
                    guild = guild ? guild.trim() : ""; command.availableInGuild[index] = guild;
                    if (!guild.match(new RegExp("^[0-9]*$", "gi"))) command.availableInGuild.splice(index, 1)
                });
                command.availableInGuild = [...new Set(command.availableInGuild)].filter(n => n);

                this.commands.set(command.name, ({category: x, ...command}))
                if (Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        aliasCmd = {...command};
                        aliasCmd.isAlias = true;
                        aliasCmd.name = alias;
                        aliasCmd.aliases = [...aliasCmd.aliases];
                        aliasCmd.aliases.splice(aliasCmd.aliases.indexOf(alias), 1);
                        aliasCmd.aliases.push(command.name);
                        this.commands.set(aliasCmd.name, ({category: "aliases", ...aliasCmd}));
                        aliasCount++;
                    });
                }
                notImportantCount++;
            }
        }
    }
    this.logger.debug('COMMANDS', `Loaded ${notImportantCount} commands and ${aliasCount} aliases`)
}

module.exports = main;
