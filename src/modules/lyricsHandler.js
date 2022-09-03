const {GENIUS_API_KEY} = new (require('./laffeyUtils'))();
const {Client} = require('genius-lyrics');
const lyricsFinder = require('lyrics-finder');

module.exports = class laffeyLyrics {
    constructor(client, mode) {
        if (!mode || typeof mode !== 'string' || !['genius', 'google'].includes(mode)) throw new Error("Invalid lyrics mode type. Received " + mode);
        if (mode == "ksoft") {
            this.client.logger.debug("LYRICS", `KSoft lyrics engine is now unsupported.`);
            mode = "google";
        }
        this.mode = mode;
        this.client = client;
        this.client.logger.debug("LYRICS", `Now using ${mode} for the lyrics engine.`)
        this.clients = {
            genius: null,
            google: null
        }
        this.validateToken();
    }

    async search(title, allresults) {
        allresults = allresults || false;
        const x = await this[this.mode](title, allresults);
        
        switch (this.mode) {
            case "genius": {
                return {...x, source: "Genius"};
            }
            case "google": {
                return {...x, source: "Google"};
            }
        }
    }

    validateToken() {
        switch (this.mode) {
            case "genius": {
                if (!GENIUS_API_KEY) throw new Error("GENIUS_API_KEY is not provided. Please add either in .env or config.json");
                this.clients.genius = new Client(GENIUS_API_KEY).songs;
                break;
            }

            case "google": {
                this.clients.google = lyricsFinder;
            }
        }
    }

    genius(title, allresults) {
        allresults = allresults || false;
        if (!title) throw new Error("No title was provided")
        if (!this.clients.genius) throw new Error("GENIUS client is either disabled or not ready.")
        return new Promise(async (resolve, reject) => {
            try {
                this.clients.genius.search(title).then(async x => {
                    const firstSong = x[0];
                    if (!x.length || !firstSong) return reject("No lyrics was found")
                    if (allresults) {
                        resolve(x)
                    } else {
                        const lyrics = await firstSong.lyrics().catch(reject);
                        resolve({
                            lyrics,
                            artist: x.artist?.name || '',
                            title: x.title,
                            artwork: x.image || null
                        })
                    }
                }).catch(reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    google(title) {
        if (!title) throw new Error("No title was provided")
        if (!this.clients.google) throw new Error("GOOGLE client is either disabled or not ready.");
        return new Promise((resolve, reject) => {
            this.clients.google(title, "").then(x => {
                if (!x) return reject("No lyrics was found")
                resolve({
                    lyrics: x,
                    artist: '',
                    title,
                    artwork: null
                })
            }).catch(reject)
        })
    }
}
