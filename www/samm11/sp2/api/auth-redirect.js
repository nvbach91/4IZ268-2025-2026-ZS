module.exports = async (req, res) => {
    const authUrl = new URL('https://www.strava.com/oauth/authorize');

    authUrl.searchParams.append('client_id', process.env.STRAVA_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', `${process.env.FRONTEND_URL}/api/auth-callback`);
    authUrl.searchParams.append('scope', 'read,activity:read_all');

    res.writeHead(302, {Location: authUrl.toString()});
    res.end();
};
