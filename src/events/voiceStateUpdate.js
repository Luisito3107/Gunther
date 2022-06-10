const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldC, newC, client) {
        if (oldC.id === client.user.id) return;
        const target = await client.users.fetch(oldC.id)
        if (target.bot) return;
        if (oldC.channelId == newC.channelId) return;

        const player = client.player?.players.get(newC.guild.id);
        if (player) {
            const voiceChannel = client.channels.cache.get(player.voiceChannel);
            const textChannel = client.channels.cache.get(player.textChannel);
            player.voiceAloneEmbed = player.voiceAloneEmbed || false;

            if (player.queue.current) {
                if (client.voiceTimeout.get(newC.guild.id)) clearTimeout(client.voiceTimeout.get(newC.guild.id)?.timeout)
                
                if (voiceChannel) {
                    let EMBED_COLOR = client.EMBED_COLOR();
                    if (voiceChannel.members.filter(x => !x.user.bot).size === 0) {
                        player.pause(true);
                        try {
                            await textChannel.send({embeds: [new EmbedBuilder()
                                .setAuthor({name: "Player paused", iconURL: client.assetsURL_icons+"/pause.png?color="+EMBED_COLOR.replace("#", "")})
                                .setColor(EMBED_COLOR)
                                .setDescription(`Where did you all go? I'll just pause the player, in case you come back ✨`)
                            ]}).then(msg => {player.voiceAloneEmbed = msg;});
                        } catch (e) {}
                        
                        if (player.get('24h').status === true) return;

                        const timeout = setTimeout(() => {
                            try {
                                try {player.voiceAloneEmbed.delete(); player.voiceAloneEmbed = false;} catch (e) {}
                                let EMBED_COLOR = client.EMBED_COLOR();
                                const leftEmbed = new EmbedBuilder()
                                    .setAuthor({name: "I had to go", iconURL: client.assetsURL_icons+"/bye.png?color="+EMBED_COLOR.replace("#", "")})
                                    .setColor(EMBED_COLOR)
                                    .setDescription(`I had to leave the voice channel due to inactivity, but you can make me play music whenever you want with the \`play\` command!`);
                                client.channels.cache.get(client.player?.players.get(newC.guild.id).textChannel)?.send({embeds: [leftEmbed]}).catch(_ => void 0);
                                client.setClientPresence("ready");
                                client.player?.players.get(newC.guild.id).destroy();
                                client.playerHandler.delete(newC.guild.id);
                            } catch (e) {}
                            clearTimeout(client.voiceTimeout.get(newC.guild.id)?.timeout)
                        }, 120 * 1000);
                        client.voiceTimeout.set(newC.guild.id, { timeout });
                    } else {
                        player.pause(false);
                        try {await player.voiceAloneEmbed.delete(); player.voiceAloneEmbed = false;} catch (e) {}
                        client.player.emit('trackStart', player, player.queue.current);
                    }
                }
            } else {
                if (voiceChannel.members.filter(x => !x.user.bot).size === 0) {
                    if (player.get('24h').status === true) return;
                    try {await player.voiceAloneEmbed.delete(); player.voiceAloneEmbed = false;} catch (e) {}
                    player.destroy();
                    client.setClientPresence("ready");
                    client.playerHandler.delete(newC.guild.id);
                }
            }
        }
    }
};
