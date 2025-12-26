import { startGoogle, handleAuthClick, handleSignoutClick } from './google.js';

$(document).ready(function() {
    getQuote();
    showTodaysDate();

    startGoogle();

    $('#authorize_button').click(handleAuthClick);
    $('#signout_button').click(handleSignoutClick);
});

function getQuote() {
    axios.get('https://dummyjson.com/quotes/random')
        .then(function(response) {
            
            const text = response.data.quote;
            const autor = response.data.author;

            $('#quote-display').html(`
                <p style="font-size: 1.2em; font-style: italic;">"${text}"</p>
                <p style="text-align: right; font-weight: bold;">— ${autor}</p>
            `);
        })
        .catch(function(error) {
            console.error("Chyba při načítání:", error);
            
            $('#quote-display').text('Nepodařilo se načíst citát. Zkontroluj internet.');
        });
}

function showTodaysDate() {
    const today = new Date();
    const dateText = today.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    $('#current-date').text(dateText);
}




