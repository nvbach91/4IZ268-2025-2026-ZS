module.exports = async (req, res) => {
    const authUrl = new URL('https://www.strava.com/oauth/authorize');

    authUrl.searchParams.append('client_id', process.env.STRAVA_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = `${protocol}://${req.headers.host}/api/auth-callback`;
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('approval_prompt', 'force');
    authUrl.searchParams.append('scope', 'read,activity:read_all');

    res.writeHead(302, {Location: authUrl.toString()});
    res.end();
};
