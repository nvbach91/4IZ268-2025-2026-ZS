import {Search} from "lucide-react";
import useSearchBar from "../hooks/useSearchBar.jsx";
import SearchResults from "./SearchResults.jsx";

export default function SearchBar() {
    const {
        searchTerm, setSearchTerm, results, isLoading, selectLocation
    } = useSearchBar();

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    }

    return (
        <div className='relative'>
            <form>
                <label htmlFor='search' className='sr-only'></label>
                <div
                    className='searchContainer bg-slate-700 flex gap-3 p-3 justify-between items-center rounded-xl w-100 border border-transparent focus-within:border-gray-400'>
                    <Search size='24' className='text-gray-400'/>
                    <input
                        className='focus:outline-none w-full bg-slate-700 text-white'
                        type='text'
                        id='search'
                        name='search'
                        placeholder='Enter city name...'
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                </div>
            </form>

            <SearchResults
                results={results}
                isLoading={isLoading}
                onSelect={selectLocation}
                searchTerm={searchTerm}
            />
        </div>
    );
}

