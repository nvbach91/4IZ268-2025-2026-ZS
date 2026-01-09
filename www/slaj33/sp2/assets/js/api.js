const apiURL = "https://api.spotify.com/v1";


//api call pro search bar
export async function searchData(token, query, type) {
    //odstraneni spiny z inputu (mezery a tak)
    const safeQuery = encodeURIComponent(query);

    //sestaveni url pro dotaz
    const url = `${apiURL}/search?q=${safeQuery}&type=${type}`;

    const settings = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };


    try {
        const response = await fetch(url, settings);

        const data = response.json();
        return data;

    }
    catch (error) {
        console.error(error);
    }
}


//data o uzivateli
export async function getUserData(token) {
    const url = `${apiURL}/me`

    const settings = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, settings);

        const data = response.json();
        return data;
    }
    catch (error) {
        console.error(error);
    }
}

//detaily o albu a playlistu
export async function getDetails(token, id, type) {
    const url = `${apiURL}/${type}s/${id}`

    const settings = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, settings);
        const data = await response.json();
        return data;
    }

    catch(error) {
        console.error(error);
    }
}


//detaily o skladbe
export async function getTrackDetails(token, id) {
    const url = `${apiURL}/tracks/${id}`;

    const settings = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, settings);
        const data = await response.json();
        return data;
    }
    catch(error) {
        console.error(error);
    }
}


//audio features pro track page
export async function getAudioFeatures(token, id) {
    const url = `${apiURL}/audio-features/${id}`;

    const settings = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, settings);
        return await response.json();
    } catch(error) {
        console.error("Chyba při stahování audio features:", error);
        return null;
    }

}