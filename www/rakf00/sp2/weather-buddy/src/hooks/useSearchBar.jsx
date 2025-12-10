import { useState, useEffect } from 'react';
import useDebounce from './useDebounce.jsx';
import { searchLocations } from '../services/locationService.js';
import useStoreSettings from "../store/useStoreSettings.jsx";


const SEARCH_DELAY_MS = 300;

export default function useSearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DELAY_MS);

    const updateSettings = useStoreSettings((state) => state.updateSettings);
    const settings = useStoreSettings((state) => state.settings);

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchTerm) {
                setIsLoading(true);
                const locations = await searchLocations(debouncedSearchTerm);
                setResults(locations);
                setIsLoading(false);
            } else {
                setResults([]);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

    const selectLocation = (location) => {
        let newSettings = { ...settings, location };
        updateSettings(newSettings);
        setSearchTerm("");
        setResults([]);
    };

    return {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
        selectLocation,
    };
}