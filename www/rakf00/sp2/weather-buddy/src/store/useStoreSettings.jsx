import {create} from 'zustand';
import {loadFromLocalStorage, saveToLocalStorage} from "../utils/localstorage.js";

const KEY = 'USER_SETTINGS';

const FIRST_RUN_SETTINGS = {
    location: {
        id: 5391959,
        latitude: 37.7749,
        longitude: -122.4194,
        name: 'San Francisco',
        country: 'USA',
    },
    defaultLocation: null
}

const useStoreSettings = create((set) => ({
    settings: loadFromLocalStorage(KEY) || FIRST_RUN_SETTINGS,
    updateSettings: (newSettings) => {
        saveToLocalStorage(KEY, newSettings);
        set({settings: newSettings});
    },
}));

export default useStoreSettings;