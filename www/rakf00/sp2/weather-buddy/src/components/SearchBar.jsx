import {Search} from "lucide-react";
import Button from "./Button.jsx";


export default function SearchBar() {
    return (
        <form className=''>
            <label htmlFor='search'></label>
            <div className='searchContainer bg-slate-700 flex gap-3 p-2 justify-between items-center rounded-xl w-100 border border-transparent focus-within:border-gray-400'>
                <Search size='24'/>
                <input className='focus:outline-none w-full ' type='text' id='search' name='search' placeholder='Enter city name...'/>
                <Button name='Search' className='text-sm cursor-pointer rounded-xl' type='button'/>
            </div>
        </form>
    )
}

