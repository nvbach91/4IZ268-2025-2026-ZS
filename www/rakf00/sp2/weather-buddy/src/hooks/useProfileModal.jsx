import {useCallback, useState} from 'react';
import {loadFromLocalStorage} from "../utils/localstorage.js";

const getInitialState = () => {
    return !loadFromLocalStorage('USER_SETTINGS');
}

export default function useProfileModal() {

    const [isModalOpen, setIsModalOpen] = useState(getInitialState);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        if (getInitialState()) return;
        setIsModalOpen(false);
    }, []);

    return {isModalOpen, openModal, closeModal};
}