const BookBuddyAPI = (() => {
  const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  // Funkce vyhledávání knih
  async function searchBooks(query, startIndex = 0, maxResults = 10) {
    if (!query || query.trim().length < 3) return { items: [], totalItems: 0 };

    try {
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`
      );
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      if (!data.items) return { items: [], totalItems: 0 };
      console.log(data);
      const books = data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title || 'Unknown Title',
        authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
        language: item.volumeInfo.language || 'Unknown language',
        description: item.volumeInfo.description || 'No description available.',
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || './assets/images/no-cover.png',
        publishedDate: item.volumeInfo.publishedDate || 'N/A',
        infoLink: item.volumeInfo.infoLink || '#',
        categories: item.volumeInfo.categories || []
      }));

      return { items: books, totalItems: data.totalItems || 0 };
    } catch (error) {
      console.error('Error loading books:', error);
      return { items: [], totalItems: 0 };
    }
  }

  return { searchBooks };
})();
