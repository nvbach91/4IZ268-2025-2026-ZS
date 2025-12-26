import {useEffect, useState} from "react";
import useDebounce from "./useDebounce.jsx";
import {searchLocations} from "../services/locationService.js";
import useStoreSettings from "../store/useStoreSettings.jsx";

const SEARCH_DELAY_MS = 500;

export default function useSearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isLoadingResults, setIsLoadingResults] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DELAY_MS);

    const updateSettings = useStoreSettings((state) => state.updateSettings);
    const settings = useStoreSettings((state) => state.settings);
    // loading je true když uživatel píše (searchTerm existuje, ale ještě se nerovná debouncedSearchTerm)
    // nebo když se právě načítají výsledky z API
    const isLoading = !!(searchTerm && searchTerm !== debouncedSearchTerm) || isLoadingResults;

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchTerm) {
                setIsLoadingResults(true);
                const locations = await searchLocations(debouncedSearchTerm);
                setResults(locations);
                setIsLoadingResults(false);
            } else {
                setResults([]);
                setIsLoadingResults(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

    const selectLocation = (location) => {
        let newSettings = {...settings, location};
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
