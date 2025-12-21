const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
};
const res = (code, body) => ({
    statusCode: code,
    headers,
    body: JSON.stringify(body),
});

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS")
        return {statusCode: 200, headers, body: ""};
    if (event.httpMethod !== "POST")
        return res(405, {error: "Method Not Allowed"});
    try {
        const {weatherData, preferences} = JSON.parse(event.body);
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0125",
                messages: [
                    {
                        role: "user",
                        content: "You are a friendly assistant who gives concise recommendations.",
                    },
                    {
                        role: "user",
                        content: `Write a short personal description of what clothes to choose depending on the weather.
         If it is rainy, mention a raincoat or umbrella, otherwise do not. Short, max 3 sentences. 
        Consider info about person (age, weight in kg, height in cm etc.): ${JSON.stringify(preferences)} and Hourly weather data: ${JSON.stringify(weatherData)}.`,
                    },
                ],
                max_tokens: 100,
            }),
        });
        const data = await response.json();
        return res(200, {result: data.choices[0].message.content.trim()});
    } catch {
        return res(500, {error: "Failed to fetch recommendation"});
    }
};
