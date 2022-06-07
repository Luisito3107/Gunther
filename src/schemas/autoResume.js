const mongoose = require("mongoose");

const autoResumeSchema = new mongoose.Schema({
    guildID: String,
    voiceChannel: String,
    textChannel: String,
    queue: Array,
    currentSong: Object,
    bassboost: String,
    volume: Number,
    loopQueue: Boolean,
    loopSong: Boolean,
    nightcore: Boolean,
    vaporwave: Boolean,
    speed: Number,
    pitch: Number,
    _8d: Boolean,
    _24h: Boolean,
    karaoke: Boolean,
    pop: Boolean,
    soft: Boolean,
    treblebass: Boolean,
    vibrato: Boolean,
    tremolo: Boolean,
    playerID: String,

    recentQueue: Array
})

module.exports = mongoose.model('autoResume', autoResumeSchema);