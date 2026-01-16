const API_BASE = 'https://restcountries.com/v3.1';

export async function fetchAllCountries() {
    const fields = 'name,cca3,flags,population,region,capital';
    const response = await fetch(`${API_BASE}/all?fields=${fields}`);
    
    if (!response.ok) {
        throw new Error(`HTTP chyba! Status: ${response.status}`);
    }
    
    return await response.json();
}

export async function fetchCountryDetail(code) {
    const response = await fetch(`${API_BASE}/alpha/${code}`);
    
    if (!response.ok) {
        throw new Error('Stát nenalezen.');
    }
    
    const data = await response.json();
    return data[0];
}