const API_BASE = 'https://restcountries.com/v3.1';

//Fetches a list of all countries with basic data.
export async function fetchAllCountries() {
    // Download only the data we actually need for the list (name, flag, etc.) using url magic.
    // Without this, the API would return a huge amount of data for each country and the application would be slow.
    const fields = 'name,cca3,flags,population,region,capital';
    const response = await fetch(`${API_BASE}/all?fields=${fields}`);
    // Check if the server responded correctly (status 200-299)
    // If the server returns an error like some random 500, we throw an exception.
    if (!response.ok) {
        throw new Error(`HTTP chyba! Status: ${response.status}`);
    }
    // Converting the raw response (stream) to a JSON object.
    return await response.json();
}
//Fetches detailed data for a specific country by its code.
export async function fetchCountryDetail(code) {
    // Calling the specific alpha endpoint to get details of a single country.
    const response = await fetch(`${API_BASE}/alpha/${code}`);

    if (!response.ok) {
        throw new Error('Stát nenalezen.');
    }
    const data = await response.json();
    //Even for single country details, the API returns an array with one object.
    // So we must return the first element -index 0 to get the actual country object.
    return data[0];
}