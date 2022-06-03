const {readdirSync} = require('fs');
const {join} = require('path');
const {Routes} = require("discord-api-types/v9");
const {REST} = require('@discordjs/rest');
const {TOKEN} = new (require('./laffeyUtils'))();
const { VALID_SERVERS } = new (require('./guntherUtils'))();
const {getChoiceByChar, question} = require('cli-interact');


const commands = new Map();
let applicationId, result, guildId, body;

function loadCommands() {
    for (const x of readdirSync(join(__dirname, "..", "commands"))) {
        for (let command of readdirSync(join(__dirname, "..", "commands", x))) {
            command = require(`../commands/${x}/${command}`)
            if (!command.availableInGuild) command.availableInGuild = VALID_SERVERS;
            command.availableInGuild = Array.isArray(command.availableInGuild) ? command.availableInGuild : [];
            command.availableInGuild.forEach((guild, index) => {
                guild = guild ? guild.trim() : ""; command.availableInGuild[index] = guild;
                if (!guild.match(new RegExp("^[0-9]*$", "gi"))) command.availableInGuild.splice(index, 1)
            });
            command.availableInGuild = [...new Set(command.availableInGuild)].filter(n => n);

            commands.set(command.name, command);
            if (Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    aliasCmd = {...command};
                    aliasCmd.name = alias;
                    commands.set(aliasCmd.name, aliasCmd);
                });
            }
        }
    }
}

async function registerGuild(guildId, registerOrDelete) {
    registerOrDelete = registerOrDelete || "Register"
    const rest = new REST().setToken(TOKEN);

    if (registerOrDelete == "Delete") {
        let commands = 0;
        console.log(`[SLASH REGISTER] -> Deleting GUILD slash commands on ${guildId}.`);
        await rest.get(Routes.applicationGuildCommands(applicationId, guildId)).then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationGuildCommands(applicationId, guildId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
                commands++
            }
        });
        console.log(`[SLASH REGISTER] -> Deleted ${commands} GUILD slash commands.`);
    } else {
        finalCommands = [];
        [...commands.values()].forEach(x => {
            if (x.availableInGuild.length <= 0 || x.availableInGuild.includes(guildId)) finalCommands.push({
                name: x.name,
                description: x.description ? x.description : '',
                options: x.args ? x.args : [],
                default_permission: true
            })
        });
        body = {body: finalCommands}

        console.log(`[SLASH REGISTER] -> Refreshing GUILD slash commands on ${guildId}.`);
        const {s, e} = await rest.put(Routes.applicationGuildCommands(applicationId, guildId), body).catch(_ => ({
            s: false,
            e: _.toString()
        }));
        if (typeof s === "boolean") return console.log(`[SLASH REGISTER] -> There was an error while registering the slash command. ${e}`);
        console.log(`[SLASH REGISTER] -> Refreshed GUILD slash command.`);
    }
}

async function registerGlobal(registerOrDelete) {
    const rest = new REST().setToken(TOKEN);

    if (registerOrDelete == "Delete") {
        let commands = 0;
        console.log(`[SLASH REGISTER] -> Deleting GLOBAL slash commands`);
        await rest.get(Routes.applicationCommands(applicationId)).then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(applicationId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
                commands++
            }
        });
        console.log(`[SLASH REGISTER] -> Deleted ${commands} GLOBAL slash commands.`);
    } else {
        body = {
            body: [...commands.values()].map(x => ({
                    name: x.name,
                    description: x.description ? x.description : '',
                    options: x.args ? x.args : [],
                    default_permission: true
                }
            ))
        }

        console.log(`[SLASH REGISTER] -> Refreshing GLOBAL slash commands.`);
        const {s, e} = await rest.put(Routes.applicationCommands(applicationId), body).catch(_ => ({
            s: false,
            e: _.toString()
        }));
        if (typeof s === "boolean") return console.log(`[SLASH REGISTER] -> There was an error while registering the slash command. ${e}`);
        console.log(`[SLASH REGISTER] -> Refreshed GLOBAL slash command. You may need a few minutes until it registered to all guilds.`);
    }
}

async function registerCommandsFromConsole() {
    console.log(`[SLASH REGISTER] -> Loading commands.`);
    loadCommands();
    console.log(`[SLASH REGISTER] -> Loaded ${commands.size} commands.`);

    registerOrDelete = getChoiceByChar("Want to register commands or delete previous registers?", ["Register", "Delete"]);
    applicationId = question("What is your Application ID? (Your bot's user ID)");
    result = getChoiceByChar("Where do you want to register the slash command", [
        "Global",
        "Guild"
    ]);

    if (result === "Global") return registerGlobal(registerOrDelete);
    else if (result === "Guild") {
        guildId = question("What is the Guild ID that you want to register in?");
        return registerGuild(guildId, registerOrDelete);
    }
}

async function registerCommandsFromBot(client, guild) {
    guild = guild || false;
    loadCommands();
    applicationId = client.user.id;

    if (guild) {
        try {
            await guild.commands.set([]);
            await registerGuild(guild.id);
            return true;
        } catch (e) {
            console.log(`[SLASH REGISTER] -> An error occurred, probably missing the Application Commands permission or exceeded daily register limit.`)
            return false;
        }
    } else {
        await Promise.all(client.guilds.cache.map(async (guild) => {
            try {
                await guild.commands.set([]);
                await registerGuild(guild.id);
            } catch (e) {
                console.log(`[SLASH REGISTER] -> An error occurred, probably missing the Application Commands permission or exceeded daily register limit.`)
            }
        }));
    }
}

module.exports = {
    registerCommandsFromConsole, registerCommandsFromBot
}