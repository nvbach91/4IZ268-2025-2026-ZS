import {useState, useEffect} from 'react';
import {loadFromLocalStorage} from "../utils/localstorage.js";
import useStoreSettings from "../store/useStoreSettings.jsx";

const arePreferencesValid = (settings) => {
    if (!settings || !settings.preferences) return false;
    const {age, height, weight, sensitivity} = settings.preferences;
    return age && height && weight && sensitivity;
}

const getInitialState = () => {
    const settings = loadFromLocalStorage('USER_SETTINGS');
    return !arePreferencesValid(settings);
}

export default function useProfileModal() {
    const settings = useStoreSettings((state) => state.settings);
    const [isModalOpen, setIsModalOpen] = useState(getInitialState);

    useEffect(() => {
        const hasValidPrefs = arePreferencesValid(settings);
        if (hasValidPrefs) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsModalOpen(false);
        } else {
            setIsModalOpen(true);
        }
    }, [settings]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        const hasValidPrefs = arePreferencesValid(settings);
        if (hasValidPrefs) {
            setIsModalOpen(false);
        }
    };

    return {isModalOpen, openModal, closeModal};
}