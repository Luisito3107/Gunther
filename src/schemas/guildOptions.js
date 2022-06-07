const mongoose = require("mongoose");

const guildOptionsSchema = new mongoose.Schema({
    guildID: String,

    autoplayOnQueueEnd: Boolean
})

module.exports = mongoose.model('guildOptions', guildOptionsSchema);