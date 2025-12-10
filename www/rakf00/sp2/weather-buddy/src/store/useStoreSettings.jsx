import {create} from 'zustand';
import {loadFromLocalStorage, saveToLocalStorage} from "../utils/localstorage.js";

const KEY = 'USER_SETTINGS';

const useStoreSettings = create((set) => ({
    settings: loadFromLocalStorage(KEY) || undefined,
    updateSettings: (newSettings) => {
        saveToLocalStorage(KEY, newSettings);
        set({settings: newSettings});
    },
}));

export default useStoreSettings;