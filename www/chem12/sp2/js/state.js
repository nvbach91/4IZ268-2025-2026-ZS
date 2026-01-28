import { config } from './config.js';
import { showToast } from './utils.js';




// Interní stav aplikace 
const state = {
    backlog: [],
    currentView: 'search'
};




// Načtení dat z paměti do backlogu při startu
export const initStorage = () => {
    try {
        const storedData = localStorage.getItem(config.storageKey);
        if (storedData) {
            state.backlog = JSON.parse(storedData);
        }
    } catch (e) {
        console.error('Chyba při čtení localStorage:', e);
        showToast('Nepodařilo se načíst uložená data.', 'error');
    }
};




// trvale ulozeni dat do local storage 
export const saveData = () => {
    try {
        localStorage.setItem(config.storageKey, JSON.stringify(state.backlog));
    } catch (e) {
        console.error('Storage Error', e);
        showToast('Chyba při ukládání dat.', 'error');
    }
};




// getter pro backlog 
export const getBacklog = () => state.backlog;




// je to id v backlogu boolean  
export const isInBacklog = (id) => state.backlog.some(g => g.id === id);




// ukladani v backlog nove hry 
export const addToBacklog = (game) => {

    // ulozim jeno to co potrebuju pro render carticek 
    const savedGame = {
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        released: game.released,
        rating: game.rating
    };
    state.backlog.push(savedGame);
    saveData();
};


// remove game z backlogu 
export const removeFromBacklog = (id) => {
    state.backlog = state.backlog.filter(g => g.id !== id);
    saveData();
};

export const getCurrentView = () => state.currentView;
export const setCurrentView = (view) => { state.currentView = view; };