function saveToLocalStorage(key, data) {
    try {
        const serializedValue = JSON.stringify(data);
        localStorage.setItem(key, serializedValue);} catch (error) {
        console.error('Error when saving to localStorage', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return undefined;
        }
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error('Error when loading from localStorage', error);
        return undefined;
    }
}

export { saveToLocalStorage, loadFromLocalStorage };