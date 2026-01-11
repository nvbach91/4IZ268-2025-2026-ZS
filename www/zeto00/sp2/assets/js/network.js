const API_BASE_URL = 'https://wger.de/api/v2';

export const searchExercises = async (term) => {
    if (!term || term.length < 2) {
        return { suggestions: [] };
    }
    
    try {
        const response = await $.ajax({
            url: `${API_BASE_URL}/exercise/search/`,
            method: 'GET',
            data: {
                term: term,
                language: 'english'
            }
        });
        return response;
    } catch (error) {
        console.error('Error searching exercises:', error);
        throw error;
    }
};

export const fetchExerciseById = async (id) => {
    try {
        const response = await $.ajax({
            url: `${API_BASE_URL}/exerciseinfo/${id}/`,
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('Error fetching exercise:', error);
        throw error;
    }
};

export const fetchCategories = async () => {
    try {
        const response = await $.ajax({
            url: `${API_BASE_URL}/exercisecategory/`,
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const fetchMuscles = async () => {
    try {
        const response = await $.ajax({
            url: `${API_BASE_URL}/muscle/`,
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('Error fetching muscles:', error);
        throw error;
    }
};
