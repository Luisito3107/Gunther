const { AUTO_SET_BOTINFO_ONSTART } = new (require('../modules/guntherUtils'))();
const Lavalink = require('../lavalink/index');
const chalk = require('chalk');
const {version} = require('../../package.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const player = new Lavalink(client)
        client.player = player
        player.init(client.user.id)
        /*client.user.setActivity(`Slash command! | Currently in ${client.guilds.cache.size} guild${client.guilds.cache.size <= 1 ? '' : 's'} | ${version}`)
        setInterval(() => {
            let statusList = [
                `Slash command! | ${client.guilds.cache.size} guild${client.guilds.cache.size <= 1 ? '' : 's'} | ${version}`,
                `Slash command! | ${client.users.cache.size} user${client.users.cache.size <= 1 ? '' : 's'} | ${version}`,
                `Slash command! | ${client.player?.players.size} player${client.player?.players.size <= 1 ? '' : 's'} | ${version}`
            ]
            let chosenStatus = statusList[Math.round(Math.random() * statusList.length)]
            client.user.setActivity(chosenStatus, {type: 3})
        }, 40000);*/
        client.setClientPresence("ready");
        console.log(chalk.green(`[CLIENT] => [READY] ${client.user.tag} is now ready!`));
        console.log(chalk.magentaBright(`[INVITE] => Invite your bot to a server: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=bot%20applications.commands`))
        
        if (AUTO_SET_BOTINFO_ONSTART) {
            try {
                client.user.setAvatar(process.cwd()+"/src/assets/img/profilepic.png");
                if (client.user.username != "Gunther") client.user.setUsername("Gunther");
            } catch (e) {}
        }
        
        client.on('raw', (d) => player.updateVoiceState(d))
    }
};