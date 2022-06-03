const {readdirSync} = require('fs');
const {join} = require('path');
const { VALID_SERVERS } = new (require('../modules/guntherUtils'))();

function main() {
    this.logger.debug('COMMANDS', 'Loading commands')
    let notImportantCount = 0, aliasCount = 0;
    for (const x of readdirSync(join(__dirname, "..", "commands"))) {
        for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
            command = require(`../commands/${x}/${command}`)
            if (!command.availableInGuild) command.availableInGuild = VALID_SERVERS;
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
    this.logger.debug('COMMANDS', `Loaded ${notImportantCount} commands and ${aliasCount} aliases`)
}

module.exports = main;
