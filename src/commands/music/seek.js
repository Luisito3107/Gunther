module.exports = {
    name: 'seek',
    description: 'Seek to a time position in the current song',
    args: [{
        "name": "time",
        "description": "Time position: number s/m/h",
        "type": 3,
        "required": true
    }],
    async execute(ctx, client) {
        const player = client.player.players.get(ctx.guildId);
        const {channel} = ctx.member.voice;
        if (!player) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});
        if (!channel) return ctx.reply({embeds: [this.baseEmbed(`🤷 | You\'re not in a voice channel`)]});
        if (player && (channel.id !== player?.voiceChannel)) return ctx.reply({embeds: [this.baseEmbed(`⚠️ | You are not in the same voice channel as me`)]});
        if (!player.queue.current) return ctx.reply({embeds: [this.baseEmbed(`💤 | Nothing is playing right now...`)]});

        const parseTimestring = function (string, returnUnit, opts) {
            const DEFAULT_OPTS = {hoursPerDay: 24, daysPerWeek: 7, weeksPerMonth: 4, monthsPerYear: 12, daysPerYear: 365.25};
            const UNIT_MAP = {
                ms: ["ms", "milli", "millisecond", "milliseconds"],
                s: ["s", "sec", "secs", "second", "seconds"],
                m: ["m", "min", "mins", "minute", "minutes"],
                h: ["h", "hr", "hrs", "hour", "hours"],
                d: ["d", "day", "days"],
                w: ["w", "week", "weeks"],
                mth: ["mon", "mth", "mths", "month", "months"],
                y: ["y", "yr", "yrs", "year", "years"]
            };
            getUnitValues = function (opts) {
                const unitValues = {ms: 0.001, s: 1, m: 60, h: 3600};
                unitValues.d = opts.hoursPerDay * unitValues.h;
                unitValues.w = opts.daysPerWeek * unitValues.d;
                unitValues.mth = (opts.daysPerYear / opts.monthsPerYear) * unitValues.d;
                unitValues.y = opts.daysPerYear * unitValues.d;
                return unitValues;
            }
            getUnitKey = function(unit) {
                for (const key of Object.keys(UNIT_MAP)) {if (UNIT_MAP[key].indexOf(unit) > -1) { return key; }}
                throw new Error(`The unit [${unit}] is not supported by timestring`);
            }
            getSeconds = function(value, unit, unitValues) { return value * unitValues[getUnitKey(unit)];}
            convert = function(value, unit, unitValues) { return value / unitValues[getUnitKey(unit)]; }
    
            try {
                opts = Object.assign({}, DEFAULT_OPTS, opts || {});
    
                let totalSeconds = 0;
                const unitValues = getUnitValues(opts);
                const groups = string
                    .toLowerCase()
                    .replace(/[^.\w+-]+/g, "")
                    .match(/[-+]?[0-9.]+[a-z]+/g);
    
                if (groups === null) { throw new Error(`The string [${string}] could not be parsed by timestring`); }
    
                groups.forEach((group) => {
                    const value = group.match(/[0-9.]+/g)[0];
                    const unit = group.match(/[a-z]+/g)[0];
    
                    totalSeconds += getSeconds(value, unit, unitValues);
                });
    
                if (returnUnit) {
                    return convert(totalSeconds, returnUnit, unitValues);
                }
    
                return totalSeconds;
            } catch (e) {
                //console.log(e);
                return false;
            }
        }

        if (!player.queue.current.isSeekable) return ctx.reply({embeds: [this.baseEmbed(`❌ | Current song is not seekable`)], ephemeral: true});
        
        let SeekTo = parseTimestring(ctx.options.getString("time"));
        if (!SeekTo && SeekTo !== 0) return ctx.reply({embeds: [this.baseEmbed(`❌ | Invalid time. Try with something like \`2m 30s\``)], ephemeral: true});

        player.seek(SeekTo * 1000);
        return ctx.reply({embeds: [this.baseEmbed(`✅ | Seeked to desired time`)]});
    }
}