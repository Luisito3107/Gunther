const {Structure, TrackUtils} = require('erela.js');

module.exports = Structure.extend('Player', player => {
    class laffeyPlayer extends player {
        constructor(...args) {
            super(...args)
            this.speed = 1;
            this.speed = 1;
            this.rate = 1;
            this.pitch = 1;
            this.bassboost = false;
            this.nightcore = false;
            this.vaporwave = false;
            this._8d = false;
            this.karaoke = false;
            this.pop = false;
            this.soft = false;
            this.treblebass = false;
            this.vibrato = false;
            this.tremolo = false;

            this.recentQueue = [];
        }

        setSpeed(speed) {
            if (isNaN(speed)) throw new RangeError('<Player>#setSpeed() must be a number.')
            this.speed = Math.max(Math.min(speed, 5), 0.05)
            this.setTimescale(speed, this.pitch, this.rate)
            return this;
        }

        setPitch(pitch) {
            if (isNaN(pitch)) throw new RangeError("<Player>#setPitch() must be a number.");
            this.pitch = Math.max(Math.min(pitch, 5), 0.05);
            this.setTimescale(this.speed, pitch, this.rate)
            return this;
        }

        setNightcore(nc) {
            if (typeof nc !== "boolean") throw new RangeError('<Player>#setNighcore() must be a boolean.');

            if (nc) {
                this.bassboost = false;
                this.distortion = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setBassboost(false)
                this.setDistortion(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.setTimescale(1.2999999523162842, 1.2999999523162842, 1);
                this.nightcore = nc;
            } else this.setTimescale(1, 1, 1);
            this.nightcore = nc;
            return this;
        }

        setVaporwave(vaporwave) {
            if (typeof vaporwave !== "boolean") throw new RangeError('<Player>#setVaporwave() must be a boolean.');

            if (vaporwave) {
                this.nightcore = false;
                this.bassboost = false;
                this.distortion = false;
                this.setBassboost(false)
                this.setNightcore(false)
                this.setDistortion(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.setTimescale(0.8500000238418579, 0.800000011920929, 1);
                this.vaporwave = vaporwave;
            } else this.setTimescale(1, 1, 1);
            this.vaporwave = vaporwave;
            return this;
        }

        setDistortion(distortion) {
            if (typeof distortion !== "boolean") throw new RangeError('<Player>#setDistortion() must be a boolean.');

            if (distortion) {
                this.nightcore = false;
                this.vaporwave = false;
                this.bassboost = false;
                this.setBassboost(false)
                this.setNightcore(false)
                this.setVaporwave(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.setDistort(0.5)
                this.distortion = distortion;
            } else this.clearEffects();
            this.distortion = distortion;
            return this;
        }

        setBassboost(bassboost) {
            if (bassboost) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.setEQ(...Array.from({length: 3}, () => {
                    return {band: 1, gain: bassboost}; // this is so nodejs can differentiate which { is for arrow function and which one is for objects
                }));
                this.bassboost = bassboost;
            } else this.clearEffects();
            this.bassboost = bassboost;
            return this;
        }

        set8D(sd) {
            if (typeof sd !== 'boolean') throw new RangeError('<Player>#set8D() must be a boolean.')
            if (sd) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    rotation: {
                        rotationHz: 0.2,
                    }
                })
                this._8d = sd
            } else this.clearEffects()
            this._8d = sd
            return this
        }

        setKaraoke(karaoke) {
            if (typeof karaoke != 'boolean') throw new RangeError('<Player>#setKaraoke() must be a boolean.')
            if (karaoke) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    karaoke: {
                        level: 1.0,
                        monoLevel: 1.0,
                        filterBand: 220.0,
                        filterWidth: 100.0
                    },
                })
                this.karaoke = karaoke
            } else this.clearEffects()
            this.karaoke = karaoke
            return this
        }

        setPop(pop) {
            if (typeof pop != 'boolean') throw new RangeError('<Player>#setPop() must be a boolean.')
            if (pop) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    equalizer: [
                        {band: 0, gain: 0.65},
                        {band: 1, gain: 0.45},
                        {band: 2, gain: -0.45},
                        {band: 3, gain: -0.65},
                        {band: 4, gain: -0.35},
                        {band: 5, gain: 0.45},
                        {band: 6, gain: 0.55},
                        {band: 7, gain: 0.6},
                        {band: 8, gain: 0.6},
                        {band: 9, gain: 0.6},
                        {band: 10, gain: 0},
                        {band: 11, gain: 0},
                        {band: 12, gain: 0},
                        {band: 13, gain: 0},
                    ],
                })
                this.pop = pop
            } else this.clearEffects()
            this.pop = pop
            return this
        }

        setSoft(soft) {
            if (typeof soft != 'boolean') throw new RangeError('<Player>#setSoft() must be a boolean.')
            if (soft) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    lowPass: {
                        smoothing: 20.0
                    }
                })
                this.soft = soft
            } else this.clearEffects()
            this.soft = soft
            return this
        }

        setTreblebass(treblebass) {
            if (typeof treblebass != 'boolean') throw new RangeError('<Player>#setTreblebass() must be a boolean.')
            if (treblebass) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setVibrato(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    equalizer: [
                        {band: 0, gain: 0.6},
                        {band: 1, gain: 0.67},
                        {band: 2, gain: 0.67},
                        {band: 3, gain: 0},
                        {band: 4, gain: -0.5},
                        {band: 5, gain: 0.15},
                        {band: 6, gain: -0.45},
                        {band: 7, gain: 0.23},
                        {band: 8, gain: 0.35},
                        {band: 9, gain: 0.45},
                        {band: 10, gain: 0.55},
                        {band: 11, gain: 0.6},
                        {band: 12, gain: 0.55},
                        {band: 13, gain: 0},
                    ],
                })
                this.treblebass = treblebass
            } else this.clearEffects()
            this.treblebass = treblebass
            return this
        }

        setVibrato(vibrato) {
            if (typeof vibrato != 'boolean') throw new RangeError('<Player>#setVibrato() must be a boolean.')
            if (vibrato) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setTremolo(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    vibrato: {
                        frequency: 10,
                        depth: 0.9
                    }
                })
                this.vibrato = vibrato
            } else this.clearEffects()
            this.vibrato = vibrato
            return this
        }

        setTremolo(tremolo) {
            if (typeof tremolo != 'boolean') throw new RangeError('<Player>#setTremolo() must be a boolean.')
            if (tremolo) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.set8D(false)
                this.setNightcore(false)
                this.setKaraoke(false)
                this.setPop(false)
                this.setSoft(false)
                this.setTreblebass(false)
                this.setVibrato(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    tremolo: {
                        frequency: 10,
                        depth: 0.5
                    }
                })
                this.tremolo = tremolo
            } else this.clearEffects()
            this.tremolo = tremolo
            return this
        }

        toggleLoop() {
            if (!this.queueRepeat && !this.trackRepeat) {
                this.setTrackRepeat(true)
                return {player: this, status: 'track'}
            } else if (this.trackRepeat) {
                this.setQueueRepeat(true)
                return {player: this, status: 'queue'}
            } else if (this.queueRepeat) {
                this.setQueueRepeat(false)
                return {player: this, status: 'none'}
            }
        }

        async skip() {
            if (this.queue.length === 0) throw new Error('Queue is empty to skip')
            const current = this.queue.current
            this.play(this.trackRepeat ? (this.queue[1] || this.queue[0]) : this.queue[0])
            if (this.queueRepeat) {
                const track = TrackUtils.build({
                    track: current.track || null,
                    info: {
                        title: current.title || null,
                        identifier: current.identifier || null,
                        author: current.author || null,
                        length: current.duration || 1,
                        isSeekable: current.isSeekable,
                        isStream: current.isStream,
                        uri: current.uri || null,
                        thumbnail: current.thumbnail || null,
                    }
                }, current.requester)
                this.queue.add(track);
                this.queue.shift();
            } else this.queue.shift();
            return this;
        }

        async skipto(target) {
            if (typeof target !== 'number') throw new RangeError('<Player>#skipto() must be a number.')
            if (this.queue.length === 0) throw new Error('Queue is empty to skip')
            if (target > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
            const current = this.queue.current;
            this.play(this.queue[parseInt(`${target}`) - 1])
            if (this.queueRepeat) {
                const track = TrackUtils.build({
                    track: current.track || null,
                    info: {
                        title: current.title || null,
                        identifier: current.identifier || null,
                        author: current.author || null,
                        length: current.duration || 1,
                        isSeekable: current.isSeekable,
                        isStream: current.isStream,
                        uri: current.uri || null,
                        thumbnail: current.thumbnail || null,
                    }
                }, current.requester)
                this.queue.add(track)
                for (let i = 0; i < parseInt(`${target}`) - 1; i++) {
                    this.queue.push(this.queue.shift());
                }
                this.queue.shift()
            } else {
                for (let i = 0; i < parseInt(`${target}`); i++) {
                    this.queue.shift()
                }
            }
            return this;
        }

        async move(first, second) {
            if (typeof first !== 'number') throw new RangeError('<Player>#move() first must be a number.')

            if (first && !second) {
                if ((parseInt(`${first}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                this.array_move(this.queue, parseInt(`${first}`) - 1, 0)
                return this;
            } else {
                if (typeof second !== 'number') throw new RangeError('<Player>#move() second must be a number.')
                if ((parseInt(`${first}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                if ((parseInt(`${second}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                this.array_move(this.queue, parseInt(`${first}`) - 1, parseInt(`${second}`) - 1)
                return this;

            }
        }

        setDistort(value) {
            this.value = value || this.value;

            this.node.send({
                op: "filters",
                guildId: this.guild,
                distortion: {
                    distortion: this.value
                }
            });
            return this
        }

        setTimescale(speed, pitch, rate) {
            this.speed = speed || this.speed;
            this.pitch = pitch || this.pitch;
            this.rate = rate || this.rate;

            this.node.send({
                op: "filters",
                guildId: this.guild,
                timescale: {
                    speed: this.speed,
                    pitch: this.pitch,
                    rate: this.rate
                },
            });
            return this;
        }

        clearEffects() {
            this.speed = 1;
            this.pitch = 1;
            this.rate = 1;
            this._8d = false;
            this.bassboost = false;
            this.nightcore = false;
            this.vaporwave = false;
            this.distortion = false;
            this.karaoke = false;
            this.pop = false;
            this.soft = false;
            this.treblebass = false;
            this.vibrato = false;
            this.tremolo = false;
            this.clearEQ();

            this.node.send({
                op: "filters",
                guildId: this.guild
            });
            return this;
        }

        array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }

        addTrackToRecentQueue(client, track) {
            let resolved = false;
            let songArtist, songTitle, uri;
            if (track.spotifydata) {
                songArtist = track.spotifydata.authorid[0];
                songTitle = track.spotifydata.trackid;
                uri = track.spotifydata.uri;
                resolved = true;
            } else {
                songArtist = client.cleanSongTitle(track.author);
                songTitle = client.cleanSongTitle(track.title, songArtist);
                uri = track.uri;
            }

            let trackData = {title: songTitle, author: songArtist, uri: uri, resolved: resolved}
            this.recentQueue = Array.from(new Set(this.recentQueue.map(track => JSON.stringify(track)))).map(track => JSON.parse(track));
            this.recentQueue = this.recentQueue.slice(0, Math.min(5, this.recentQueue.unshift(trackData)));
            return this.recentQueue;
        }
    }

    return laffeyPlayer;
})
