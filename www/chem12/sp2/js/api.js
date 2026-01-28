import { config } from './config.js';


// dotaz na server na hledane hry
export const fetchGames = async (query) => {
    return $.ajax({
        url: `${config.baseUrl}games`,
        method: 'GET',
        data: {
            key: config.apiKey,
            search: query,
            page_size: 12
        }
    });
};


// dotaz na server na konkretni hru 
export const fetchGameDetail = async (gameId) => {
    return $.ajax({
        url: `${config.baseUrl}games/${gameId}`,
        method: 'GET',
        data: { key: config.apiKey }
    });
};