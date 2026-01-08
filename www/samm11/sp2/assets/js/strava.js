const StravaAPI = (() => {
    function getToken() {
        return localStorage.getItem('strava_token');
    }

    function getRefreshToken() {
        return localStorage.getItem('strava_refresh_token');
    }

    function getTokenExpiresAt() {
        const epiresAt = localStorage.getItem('strava_expires_at');
        return epiresAt ? Number(epiresAt) : null;
    }

    function getAthlete() {
        const athlete = localStorage.getItem('strava_athlete');
        return athlete ? JSON.parse(athlete) : null;
    }

    function isAuthenticated() {
        return Boolean(getToken() && getAthlete());
    }

    async function isTokenExpired() {
        const expiresAt = getTokenExpiresAt();
        if (!expiresAt) return false;
        return (Date.now() / 1000) > (expiresAt - (300000 / 1000));
    }

    async function refreshToken() {
        const refreshToken = getRefreshToken();

        try {
            const response = await fetch('https://www.strava.com/api/v3/oauth/token', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: process.env.STRAVA_CLIENT_ID,
                    client_secret: process.env.STRAVA_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            const data = await response.json();

            localStorage.setItem('strava_token', data.access_token);
            localStorage.setItem('strava_refresh_token', data.refresh_token);
            localStorage.setItem('strava_expires_at', data.expires_at);

            return data.access_token;
        } catch (error) {
            localStorage.clear();
            throw error;
        }
    }

    async function makeRequest(endpoint, options = {}) {
        if (await isTokenExpired()) {
            await refreshToken();
        }

        const token = getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...options.headers
            }
        });

        return response.json();
    }

    async function fetchActivities(perPage = 30, page = 1) {
        const params = new URLSearchParams({
            per_page: perPage,
            page: page
        });
        return makeRequest(`/athlete/activities?${params}`);
    }

    async function fetchAllActivities(maxActivities = 200) {
        const allActivities = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && allActivities.length < maxActivities) {
            const activities = await fetchActivities(50, page);

            if (!activities || activities.length === 0) {
                hasMore = false;
            } else {
                allActivities.push(...activities);
                page++;
            }
        }

        return allActivities.slice(0, maxActivities);
    }

    return {
        getToken,
        getRefreshToken,
        getTokenExpiresAt,
        getAthlete,
        isAuthenticated,
        isTokenExpired,
        refreshToken,
        makeRequest,
        fetchActivities,
        fetchAllActivities
    };
})();
