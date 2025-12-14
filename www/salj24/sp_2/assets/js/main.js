document.getElementById('searchBtn').addEventListener('click', searchBooks);

async function searchBooks() {
    const author = document.getElementById('author').value;
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;    
    let queryParts = [];
    
    if (author) {
        queryParts.push(`inauthor:${author}`);
    }
    if (title) {
        queryParts.push(`intitle:${title}`);
    }
    if (genre) {
        queryParts.push(`subject:${genre}`);
    }
    
    if (queryParts.length === 0) {
        alert('Vyplň alespoň jedno pole');
        return;
    }
    
    const query = queryParts.join('+');
    const api = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`;
    
    console.log('API:', api);
    
    const response = await fetch(api);
    const data = await response.json();
    
    const results = document.getElementById('results');
    
    if (!data.items) {
        results.innerHTML = '<p>Žádné knihy nenalezeny.</p>';
        return;
    }
    
    const books = data.items.map((item) => {
        const book = item.volumeInfo;
        
        const div = document.createElement('div');
        
        const title = document.createElement('h3');
        title.textContent = book.title;
        
        const author = document.createElement('p');
        if (book.authors) {
            author.textContent = book.authors;
        }
        
        const image = document.createElement('img');
        if (book.imageLinks) {
            image.src = book.imageLinks.thumbnail;
        }
        
        div.appendChild(title);
        div.appendChild(author);
        div.appendChild(image);
        
        return div;
    });
    
    results.innerHTML = '';
    results.append(...books);
}