import { selectedGenres, selectedPlatforms } from "./storage.js";
import { getLanguage, getRegion } from "./storage.js";

export const API_BASE_URL = 'https://api.themoviedb.org'
export const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNGFkYzAwZDFmY2UwNzg5YTUzOTAxZTUwZWM0YjkxYSIsIm5iZiI6MTc2NTcxMzY4Mi45MzkwMDAxLCJzdWIiOiI2OTNlYTcxMmIzZmNiZDVlM2U5OTk1NmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0CVI2wvbGl7vkakdL2O9ymIMS22NfEbqRtO6kZWUlG4'


/**
 * Fetches detailed information about a movie by its ID
 * @param {number} movieId - The ID of the movie
 * @returns {Object} Response data from the API
 */
export const getMovieDetail = async (movieId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/3/movie/${movieId}?language=${getLanguage()}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
}

/**
 * Searches movies by text query
 * @param {string} text - The text to search for
 * @returns {Object} Response data from the API
 */
export const searchByText = async (text) => {
  text = text.replace(' ', '%20')
  const response = await axios.get(
    `${API_BASE_URL}/3/search/movie?query=${text}&include_adult=false&language=${getLanguage()}&page=1`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    }
  );
  console.log(response.data)
  return response.data;
};

/**
 * Fetches available movie genres from the API
 * @returns {Object} Response data from the API
 */
export const getGenres = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/3/genre/movie/list?language=${getLanguage()}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return null;
  }
}

/**
 * Fetches available streaming platforms from the API
 * @returns {Object} Response data from the API
 */
export const getPlatforms = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/3/watch/providers/movie?language=${getLanguage()}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return null;
  }
}

/**
 * Fetches streaming platforms for a specific movie by its ID
 * @param {number} movieId - The ID of the movie
 * @returns {Object} Response data from the API
 */
export const getPlatformsForMovie = async (movieId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/3/movie/${movieId}/watch/providers`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching platforms for movie:', error);
    return null;
  }
}

/**
 * Search movies by selected genres and platforms
 * @param {Array} selectedGenres - Array of selected genre IDs
 * @param {Array} selectedPlatforms - Array of selected platform IDs
 * @returns {Object} Response data from the API
 */

// I need to modify this so that it takes first page and continues to next one when the results are read

export const searchByGenresAndPlatforms = async (pageNumber) => {
  let constructedUrl =
    `${API_BASE_URL}/3/discover/movie` +
    '?include_adult=false&' +
    'include_video=false&' +
    `language=${getLanguage()}&` +
    'sort_by=popularity.desc' +
    `&page=${pageNumber}`
  if (selectedGenres.length > 0) {
    constructedUrl += `&with_genres=${selectedGenres.join('|')}`
  }
  if (getRegion()) {
    constructedUrl += `&watch_region=${getRegion()}`
  }
  if (selectedPlatforms.length > 0) {
    constructedUrl += `&with_watch_providers=${selectedPlatforms.join('|')}`
  }

  try {
    const response = await axios.get(
      constructedUrl,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by genres and platforms:', error);
    return null;
  }
}