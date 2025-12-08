import SearchBar from "./SearchBar.jsx";
import {UserRound} from "lucide-react";

export default function Header() {
    return (
        <header className='w-full flex justify-between items-center text-white'>
            <p className='font-bold text-2xl'>PÁ | 15.11.2025</p>
            <SearchBar/>
            <button className='cursor-pointer border rounded-3xl hover:bg-slate-700 p-2' onClick='openModal'>
                <UserRound size='24'/></button>
        </header>
    )
}