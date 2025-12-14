module.exports = async (req, res) => {
    const {code, error} = req.query;

    if (error) {
        return res.send(`
            <html>
                <body>
                    <h1>Login cancelled</h1>
                    <p>Try again</p>
                    <a href="${process.env.FRONTEND_URL}">Back</a>
                </body>
            </html>
        `);
    }

    if (!code) {
        return res.status(400).send('Missing authorization code');
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

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Prihlasovanie... </title>
            </head>
            <body>
                <p>Prihlasovanie úspešné, presmerovávam... </p>
                <script>
                    const tokenData = ${JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            athlete: data.athlete
        })};
                    
                    localStorage.setItem('strava_token', tokenData. access_token);
                    localStorage.setItem('strava_athlete', JSON.stringify(tokenData.athlete));
                    
                    // Presmeruj na hlavnú stránku
                    window.location.href = '${process.env.FRONTEND_URL}';
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('OAuth error:', error);
        return res.status(500).send(`
            <html>
                <body>
                    <h1>Login error</h1>
                    <p>${error.message}</p>
                    <a href="${process.env.FRONTEND_URL}">Try again</a>
                </body>
            </html>
        `);
    }
};
