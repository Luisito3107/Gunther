const { AUTO_SET_BOTINFO_ONSTART, VALID_SERVERS } = new (require('../modules/guntherUtils'))();
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild, client) {
        client.logger.debug('GUILD', `${guild.name} joined with ${guild.memberCount} users`)

        let defaultChannel = "";
        await Promise.all(guild.channels.cache.map(async (channel) => {
            if(channel.type == 0 && defaultChannel == "") {
                if (channel.permissionsFor(guild.members.me).has(["SendMessages"])) { defaultChannel = channel; }
            }
        }));

        if (VALID_SERVERS.length) {
            if (!(VALID_SERVERS.includes(guild.id))) {
                defaultChannel.send({embeds: [new EmbedBuilder().setColor(client.EMBED_COLOR())
                    .setDescription("😝 | Nice try, little one, but this bot was not made for your server. Better luck next time!")]});

                return client.guilds.cache.get(guild.id)
                .leave() // Leave
                .then(g => client.logger.debug('GUILD', `Leaved ${guild.name}, as it is not in the valid servers array`)) // Give confirmation after leaving
                .catch(console.error);
            }
        }

        if (AUTO_SET_BOTINFO_ONSTART) {
            try {
                await guild.members.me.setNickname("Gunther");
            } catch (e) {}
        }

        let intro = new EmbedBuilder()
            .setTitle('**Hey, hi, hello!**')
            .setDescription(
                `Thank you for inviting me to your server. As you may have noticed, my name is **Gunther** (not Gunter 🤫), and I am a bot created by <@546441136479404052>, as a replacement for the beloved Groovy bot.\n\n`+
                `This bot now works only with slash (/) commands. Start with the \`help\` command, to give you an idea of everything I can do, we are going to have a great time!`
            )
            .setColor("#09b9fa")
            .setImage("https://c.tenor.com/4aKNk-BWBFgAAAAC/adventure-time-penguin.gif")
            .setFooter({text: "I'm not allowed to join any other server, so don't even bother."})
        defaultChannel.send({embeds: [intro]})

        const { registerCommandsFromBot } = require("../modules/slashRegister");
        const registerCommands = await registerCommandsFromBot(client, guild);
        if (!registerCommands)
            defaultChannel.send({embeds: [new EmbedBuilder().setColor("ff0000")
                .setDescription("💣 | An error occurred while registering slash commands. Kick and reinvite Gunther.")]});
    }
};