$(document).ready(function() {

    $('#btn-fetch-api').click(function() {
        const query = $('#api-search').val();

        if (!query) {
            alert("Enter the title or ISBN");
            return;
        }

        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}`;

        axios.get(apiUrl)
            .then(function (response) {
                
                if (response.data.totalItems > 0) {
                    const book = response.data.items[0].volumeInfo;

                    $('#title').val(book.title);
                    $('#author').val(book.authors ? book.authors.join(', ') : 'Unknown author');
                    $('#genre').val(book.categories ? book.categories[0] : '');
                    if (book.imageLinks && book.imageLinks.thumbnail) {
                        const imgUrl = book.imageLinks.thumbnail;
                        $('#cover-url').val(imgUrl);
                        $('#cover-preview').attr('src', imgUrl).show();
                    }

                    console.log("Book loaded:", book.title);
                } else {
                    alert("Book has not been found.");
                }
            })
            .catch(function (error) {
                console.error("Error API:", error);
                alert("An error occurred while communicating with the server.");
            });
    });

});