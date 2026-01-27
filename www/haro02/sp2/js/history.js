export const History = {
    getUrlState() {
        const url = new URL(window.location.href);

        const mode = url.searchParams.get("mode") || "none";
        const query = (url.searchParams.get("query") || "");
        const userId = url.searchParams.get("userId");
        const userName = url.searchParams.get("userName");

        const storedSong = url.searchParams.get("song");
        let song = null;
        if (storedSong) {
            song = JSON.parse(decodeURIComponent(storedSong));
        }

        console.log(song);

        return {mode, query, userId, userName, song};
    },

    pushSongDetailsState(song) {
        const url = new URL(window.location.href);

        if (song === null || song === undefined) {
            url.searchParams.delete("song");
        } else {
            url.searchParams.set("song", encodeURIComponent(JSON.stringify(song)));
        }

        history.pushState(null, "", url.toString());
    },

    pushUrlState(mode, query, userId, userName) {
        const url = new URL(window.location.href);

        url.searchParams.set("mode", mode);
        url.searchParams.set("query", query);

        if (userId === null || userId === undefined) {
            url.searchParams.delete("userId");
        } else {
            url.searchParams.set("userId", userId);
        }

        if (userName === null || userName === undefined) {
            url.searchParams.delete("userName");
        } else {
            url.searchParams.set("userName", userName);
        }

        history.pushState(null, "", url.toString());
    }
}
