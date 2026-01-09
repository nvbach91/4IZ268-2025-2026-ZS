export const generateRecommendation = async (weatherData, preferences) => {
    try {
        const response = await fetch("/.netlify/functions/openAI", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({weatherData, preferences}),
        });
        const data = await response.json();
        return data.result;
    } catch {
        return "No recommendation for you, sorry buddy :(";
    }
};
