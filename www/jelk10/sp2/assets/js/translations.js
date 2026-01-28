import { getLanguage } from "./storage.js"

export const Translations = {
    Choose: {
        'en-US': 'Please choose desired',
        'cs-CZ': 'Prosím vyberte požadované',
        'de-DE': 'Bitte wählen Sie gewünschte',
    },
    NoFavorites: {
        'en-US': 'ℹ️ You have no favorite movies yet. Start adding some!',
        'cs-CZ': 'ℹ️ Ještě nemáte žádné filmy přidané mezi oblíbené. Začněte přidávat!',
        'de-DE': 'ℹ️ Sie haben noch keine Lieblingsfilme. Fangen Sie an, einige hinzuzufügen!',
    },
    ErrorFetching: {
        'en-US': '❌ An error occured while fetching available',
        'cs-CZ': '❌ Nastala chyba při načítání dostupných',
        'de-DE': '❌ Beim Abrufen der verfügbaren ist ein Fehler aufgetreten',
    },
    genres: {
        'en-US': 'genres',
        'cs-CZ': 'žánrů',
        'de-DE': 'Genres',
    },
    genre: {
        'en-US': 'genre',
        'cs-CZ': 'žánry',
        'de-DE': 'genre',
    },
    platform: {
        'en-US': 'streaming platforms',
        'cs-CZ': 'streamovací platformy',
        'de-DE': 'Streaming-Plattform',
    },
    platforms: {
        'en-US': 'streaming platforms',
        'cs-CZ': 'streamovacích platforem',
        'de-DE': 'Streaming-Plattformen',
    },
    NoResults: {
        'en-US': '⚠ No movies found matching the selected criteria. Please choose different genres or platforms.',
        'cs-CZ': '⚠ Nebyly nalezeny žádné filmy odpovídající vybraným kritériím. Zvolte prosím jiné žánry nebo platformy.',
        'de-DE': '⚠ Es wurden keine Filme gefunden, die den ausgewählten Kriterien entsprechen. Bitte versuchen Sie es mit anderen Genres oder Plattformen.',
    },
    MovieDetails: {
        'en-US': 'Movie Details',
        'cs-CZ': 'Detail filmu',
        'de-DE': 'Filmdetails',
    },
    RemoveAllFavorites: {
        'en-US': '🗑️ Remove All Favorites',
        'cs-CZ': '🗑️ Odstranit všechny oblíbené',
        'de-DE': '🗑️ Alle Favoriten entfernen',
    },
    Remove: {
        'en-US': '🗑️ Remove',
        'cs-CZ': '🗑️ Odstranit',
        'de-DE': '🗑️ Entfernen',
    },
    Generate: {
        'en-US': 'Generate Random Movie',
        'cs-CZ': 'Vygenerovat náhodný film',
        'de-DE': 'Zufälligen Film generieren',
    },
    Loading: {
        'en-US': 'Loading, please wait...',
        'cs-CZ': 'Načítání, prosím čekejte...',
        'de-DE': 'Wird geladen, bitte warten...',
    },
    Like: {
        'en-US': '❤️ Add to Favorites',
        'cs-CZ': '❤️ Přidat mezi oblíbené',
        'de-DE': '❤️ Gefällt mir',
    },
    NoSearchResults: {
        'en-US': '⚠ No movies found matching your search. Please try different keywords.',
        'cs-CZ': '⚠ Nebyly nalezeny žádné filmy odpovídající vašemu vyhledávání. Zkuste prosím jiný dotaz',
        'de-DE': '⚠ Es wurden keine Filme gefunden, die Ihrer Suche entsprechen. Bitte versuchen Sie es mit anderen Schlüsselwörtern.',
    },
}

export const getTranslation = (key) => {
    const language = getLanguage()
    return Translations[key][language] || Translations[key]['en-US']
}
