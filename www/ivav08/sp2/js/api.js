export async function fetchMemes() {
    const API_URL = 'https://api.imgflip.com/get_memes';
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            return data.data.memes;
        } else {
            throw new Error('API success is false');
        }
    } catch (error) {
        console.error('Eror in memes download:', error);
        return [];
    }
}