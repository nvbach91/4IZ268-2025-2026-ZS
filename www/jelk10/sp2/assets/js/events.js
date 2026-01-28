import { favoritePage, generatePage, languageSelect } from "./selectors.js"
import { renderFavorites, init } from "./renders.js"
import { setLanguage, setRegion } from "./storage.js"

export const setupNavigation = () => {

    favoritePage().on('click', () => {
        favoritePage().addClass('border-bottom border-5 border-black')
        favoritePage().blur()
        generatePage().removeClass('border-bottom border-5 border-black')
        renderFavorites()
    })

    generatePage().on('click', () => {
        generatePage().addClass('border-bottom border-5 border-black')
        favoritePage().removeClass('border-bottom border-5 border-black')
        generatePage().blur()
        init()
    })

    const dropdown = languageSelect().closest('.dropdown');
    const button = dropdown.find('.dropdown-toggle');

    const preferredLanguage = localStorage.getItem('preferredLanguage');
    if (preferredLanguage) {
        button.text(preferredLanguage);
    }

    dropdown.find('.dropdown-item').on('click', function (e) {
        e.preventDefault();
        const selectedLanguage = $(this).text().trim();
        button.text(selectedLanguage);
        setLanguage(selectedLanguage);
        setRegion(selectedLanguage);
        console.log(`Language set to: ${selectedLanguage}`);
        location.reload();
    });
}