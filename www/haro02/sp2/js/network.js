/*
 * API example:
 *
 * full search tracks and users:  https://openwhyd.org/search?q=adrien&format=json
 * user music: https://openwhyd.org/u/53a838ce66491c17b2adb299?format=json
 * hot songs: https://openwhyd.org/hot?format=json
 *
 * track entity:
 * uId - id of user who added this song to site
 * uNm - name of user
 * name - name of song
 * eId - id of song that contains info about song source like YouTube and deezer
 * img - image of song
 */

// have to proxy API as the origin API doesn't have CORS headers
const BASE_URL = "https://corsproxy.io/?https://openwhyd.org";

export const Network = {
    async findCombinedUsersAndSongs(query) {
        const url = `${BASE_URL}/search?format=json&q=${encodeURIComponent(query)}`;
        const usersResp = await axios.get(url);
        if (usersResp.status !== 200) {
            throw usersResp.statusText;
        }
        return {
            users: usersResp.data.results.users.slice(0, 10),
            songs: usersResp.data.results.posts.slice(0, 10),
        };
    },
    async findUserSongs(userId) {
        const url = `${BASE_URL}/u/${encodeURIComponent(userId)}?format=json`;
        const usersResp = await axios.get(url);
        if (usersResp.status !== 200) {
            throw usersResp.statusText;
        }
        return usersResp.data.slice(0, 10);
    },
    async findTopRatedSongs() {
        const url = `${BASE_URL}/hot?format=json`;
        const usersResp = await axios.get(url);
        if (usersResp.status !== 200) {
            throw usersResp.statusText;
        }
        return usersResp.data.tracks.slice(0, 10);
    }
}