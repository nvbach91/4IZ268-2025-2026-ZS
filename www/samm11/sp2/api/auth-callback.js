module.exports = async (req, res) => {
    const {code, error} = req.query;
    const $error = `
            <html>
                <body>
                    <h1>Login cancelled</h1>
                    <p>Try again</p>
                    <a href="${process.env.FRONTEND_URL}">Back</a>
                </body>
            </html>
        `;

    if (!code || error) {
        console.log(error);
        return res.send($error);
    }

    try {
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(data.message || 'Token exchange failed');
        }

        const tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            athlete: data.athlete
        };

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Logging in to Strava</title>
            </head>
            <body>
                <script>
                    const tokenData = ${JSON.stringify(tokenData)};
                    localStorage.setItem('strava_token', tokenData.access_token);
                    localStorage.setItem('strava_refresh_token', tokenData.refresh_token);
                    localStorage.setItem('strava_expires_at', tokenData.expires_at);
                    localStorage.setItem('strava_athlete', JSON.stringify(tokenData.athlete));
                    
                    window.location.href = '${process.env.FRONTEND_URL}';
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('OAuth error:', error);
        return res.send($error);
    }
};
