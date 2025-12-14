const API_BASE_URL = 'https://api.themoviedb.org'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNGFkYzAwZDFmY2UwNzg5YTUzOTAxZTUwZWM0YjkxYSIsIm5iZiI6MTc2NTcxMzY4Mi45MzkwMDAxLCJzdWIiOiI2OTNlYTcxMmIzZmNiZDVlM2U5OTk1NmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0CVI2wvbGl7vkakdL2O9ymIMS22NfEbqRtO6kZWUlG4'

const exampleFetch = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/3/movie/11`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};