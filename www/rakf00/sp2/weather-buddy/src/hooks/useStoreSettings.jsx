import {create} from 'zustand';
import {loadFromLocalStorage, saveToLocalStorage} from "../utils/localstorage.js";

const KEY = 'USER_SETTINGS';

const DEFAULT_SETTINGS = {
    age: 25,
    height: 175,
    weight: 80,
    sensitivity: 5,
};

const useStoreSettings = create((set) => ({
    settings: loadFromLocalStorage(KEY) || DEFAULT_SETTINGS,
    updateSettings: (newSettings) => {
        saveToLocalStorage(KEY, newSettings);
        console.log(JSON.parse(localStorage.getItem(KEY)));
        set({settings: newSettings});
    },
}));

export default useStoreSettings;