import {Search} from "lucide-react";


export default function SearchBar() {
    return (
        <form className=''>
            <label htmlFor='search'></label>
            <div className='searchContainer bg-slate-700 flex gap-3 p-2 justify-between items-center rounded-xl w-100 border border-transparent focus-within:border-gray-400'>
                <Search size='24'/>
                <input className='focus:outline-none w-full' type='text' id='search' name='search' placeholder='Enter city name...'/>
                <button className='text-sm bg-blue-600 p-2 hover:bg-blue-700 cursor-pointer rounded-xl' type='button'>Search</button>
            </div>
        </form>
    )
}

