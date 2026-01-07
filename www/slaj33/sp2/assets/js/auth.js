import { clientId, redirectUri, scope, authEndpoint, tokenEndpoint } from "./config.js";
import { generateRandomString, sha256, base64encode } from "./utils.js";

//Přesměrování na Spotify (Login)
export async function redirectToSpotify() {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Uložíme verifier
    window.localStorage.setItem("code_verifier", codeVerifier);

    const params = {
        response_type: "code",
        client_id: clientId,
        scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };

    const authUrl = new URL(authEndpoint);
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

//Výměna kódu za token
export async function getToken(code) {
    const codeVerifier = localStorage.getItem("code_verifier");

    const payload = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    };

    try {
        const response = await fetch(tokenEndpoint, payload);
        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            if (data.refresh_token) {
                localStorage.setItem("refresh_token", data.refresh_token);
            }
            return data.access_token;
        } else {
            console.error("Chyba auth:", data);
            return null;
        }
    } catch (error) {
        console.error("Request failed", error);
        return null;
    }
}

//Odhlášení
export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("code_verifier");
    window.location.href = redirectUri;
}