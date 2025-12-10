import { useState, useEffect } from 'react';
import useDebounce from './useDebounce.jsx';
import { searchLocations } from '../services/locationService.js';

const SEARCH_DELAY_MS = 500;

export default function useSearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DELAY_MS);

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
        console.log("Selected location:", location.name);
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