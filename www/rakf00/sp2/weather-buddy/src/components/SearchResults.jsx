import {MapPin} from 'lucide-react';

export default function SearchResults({results, isLoading, onSelect, searchTerm}) {
    let content = null;

    if (isLoading) content = "Loading...";
    else if (results.length === 0 && searchTerm.length >0) content = "No results found.";
    else if (results.length > 0)
        content = results.map(location => (
            <div
                key={location.id}
                className='p-3 text-white hover:bg-slate-600 cursor-pointer border-b flex items-center gap-3 border-gray-700 last:border-b-0'
                onClick={() => onSelect(location)}
            >
                <MapPin/>  {location.name}, {location.country}
            </div>
        ));

    return content && (
        <div
            className={`absolute z-40 w-full ${content === "No results found." | isLoading && "text-center p-3" } bg-slate-700 border overflow-y-hidden border-gray-600 mt-2 rounded-xl `}>
             {content}
        </div>
    );
}
