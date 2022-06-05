const { VALID_SERVERS } = new (require('../modules/guntherUtils'))();
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember, client) {
        if ((newMember.nickname && newMember.nickname != "Gunther") && newMember.id == client.user.id) return client.checkForNickname(newMember);
    }
};