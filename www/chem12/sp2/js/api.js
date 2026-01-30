import { config } from './config.js';


// dotaz na server na hledane hry
export const fetchGames = async (query, filters = {}) => {
    const params = {
        key: config.apiKey,
        page_size: 24,
       search_precise: true
    };

    if (query && query.length > 0) {
        params.search = query;
    }

    
    if (filters.genre) {
        params.genres = filters.genres;
    }

   
    if (filters.platforms) {
        params.platforms = filters.platforms;
    }

    return $.ajax({
        url: `${config.baseUrl}games`,
        method: 'GET',
        data: params
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

// genry api 
export const fetchGenres = async () => {
    return $.ajax({
        url: `${config.baseUrl}genres`,
        method: 'GET',
        data: { 
            key: config.apiKey, 
            page_size: 40 
        }
    });
};

// patformy api
export const fetchPlatforms = async () => {
    return $.ajax({
        url: `${config.baseUrl}platforms`,
        method: 'GET',
        data: { 
            key: config.apiKey, 
            page_size: 40 
        }
    });
};