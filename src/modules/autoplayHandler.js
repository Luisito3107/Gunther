const {TrackUtils} = require("erela.js");
const {EmbedBuilder} = require('discord.js');

module.exports = class autoplayHandler {
    constructor(client) {
        this.client = client;
    }

    async getSeedsFromRecent(recentQueue) {
        let searchSeeds = {artists: [], tracks: []}
        recentQueue = Array.from(new Set(recentQueue.map(track => JSON.stringify(track)))).map(track => JSON.parse(track));
        recentQueue = recentQueue.slice(0, Math.min(5, recentQueue.length));
        recentQueue.forEach((track, index) => {
            if (track.resolved) {
                searchSeeds.artists.push(track.author);
                searchSeeds.tracks.push(track.title);
                recentQueue.splice(index, 1);
            }
        });
        await Promise.all(recentQueue.map(async (track, index) => {
            if (searchSeeds.tracks.length < recentQueue.length) {
                const trackResults = await this.client.Lavasfy.otherApiRequest("/search", {q: `track:${track.title}+artist:${track.author}`, type: "track"});
                if (trackResults) {
                    if (trackResults.tracks.items.length) {
                        const selectedTrack = trackResults.tracks.items[0];
                        searchSeeds.artists.push(selectedTrack.artists[0].id);
                        searchSeeds.tracks.push(selectedTrack.id);
                    }
                }
                recentQueue.splice(index, 1);
            }
        }));
        searchSeeds.artists = [...new Set(searchSeeds.artists)].filter(n => n);
        searchSeeds.artists = searchSeeds.artists.slice(0, Math.min(5, searchSeeds.artists.length));
        searchSeeds.tracks = [...new Set(searchSeeds.tracks)].filter(n => n);
        searchSeeds.tracks = searchSeeds.tracks.slice(0, Math.min(5, searchSeeds.tracks.length));

        return searchSeeds;
    }

    async getTrackRecommendationsFromSeeds(searchSeeds) {
        if (!searchSeeds.tracks.length || !searchSeeds.artists.length) return {tracks: [], searchSeeds: searchSeeds};
        let recommendationsQuery = {limit: 15}
        if (searchSeeds.tracks.length) recommendationsQuery.seed_tracks = searchSeeds.tracks.join(",")
        if (searchSeeds.artists.length - searchSeeds.tracks.length > 0) recommendationsQuery.seed_artists = searchSeeds.artists.join(",")
        const recommendationsResult = await this.client.Lavasfy.otherApiRequest("/recommendations", recommendationsQuery);

        let recommendedTracks = [];

        if (recommendationsResult) {
            if (recommendationsResult.tracks.length) {
                recommendedTracks = recommendationsResult.tracks;
                recommendedTracks = recommendedTracks.map((track) => track.external_urls.spotify);
            }
        }

        return {tracks: recommendedTracks, searchSeeds: searchSeeds};
    }

    async resolveTracksAndAddToQueue(player, recommendationsResult) {
        let searchSeeds = recommendationsResult.searchSeeds ? recommendationsResult.searchSeeds : {tracks: [], artists: []};
        let recommendedTracks = recommendationsResult.tracks ? recommendationsResult.tracks : recommendationsResult;
        let node = this.client.Lavasfy.nodes.get(this.client.connectedToNode || NODES[0].IDENTIFIER);
        let res = {tracks: []}; let lavasfyDuration = 0;

        await Promise.all(recommendedTracks.map(async (track, index) => {
            let lavasfyRes = await node.load(track);

            let spotifydata = (lavasfyRes.tracks[0].info?.spotifydata ? lavasfyRes.tracks[0].info?.spotifydata : null);
            let thumbnail = (lavasfyRes.tracks[0].info?.thumbnail ? lavasfyRes.tracks[0].info?.thumbnail : null);
            track = await TrackUtils.build(await lavasfyRes.tracks[0].resolve(), this.client.user);
            track.spotifydata = spotifydata;
            track.thumbnail = thumbnail;
            res.tracks.push(track);
            lavasfyDuration += track.duration;
        }));
        
        try { if (player.get('autoPlayEmbed')) await player.get('autoPlayEmbed').delete().catch(_ => void 0); } catch (e) {}
        const channel = this.client.channels.cache.get(player.textChannel);
        let EMBED_COLOR = /*"#00b8fb"*/ this.client.EMBED_COLOR();
        await channel.send({embeds: [new EmbedBuilder()
            .setAuthor({name: "Added autoplay mix to the queue", iconURL: this.client.assetsURL_icons+"/autoplay.png?color="+EMBED_COLOR.replace("#", "")})
            .setTitle(`Mix based on the last ${(searchSeeds.tracks.length > 1 ? `${searchSeeds.tracks.length} songs` : "song")} played ${searchSeeds.artists.length ? (searchSeeds.artists.length > 1 ? `from ${searchSeeds.artists.length} artists` : "") : ""}`)
            .setColor(EMBED_COLOR)
            .setDescription(`Could any of these songs be your next favorite song? ✨`)
            .setFields([
                {name: "Tracks", value: String(res.tracks.length), inline: true},
                {name: "Duration", value: `\`${this.client.formatDuration(lavasfyDuration)}\``, inline: true},
                //{name: "Queue position", value: `\`${Math.max(player.queue.size-res.tracks.length, 0)}\``, inline: true}
            ])
            .setThumbnail("https://i.ibb.co/MRd2zgN/Gunther-Auto-Play.png")
            .setFooter({text: "You can turn off this feature with the /autoplay command."})
        ]}).catch(_ => void 0);

        await player.queue.add(res.tracks);
        if (!player.playing && !player.paused) player.play()
        this.client.playerHandler.savePlayer(player);
    }
}