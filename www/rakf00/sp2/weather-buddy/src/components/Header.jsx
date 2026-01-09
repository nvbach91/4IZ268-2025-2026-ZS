import SearchBar from "./SearchBar.jsx";
import {UserRound, RefreshCw} from "lucide-react";

export default function Header({openModal}) {
    const handleRefresh = () => {
        location.reload();
    };

    return (<header className="relative z-50 w-full flex items-center justify-between">
            <button onClick={handleRefresh}
                    className="cursor-pointer hover:scale-105"><RefreshCw
                size="24"/></button>
            <div className="absolute left-1/2 -translate-x-1/2 z-50">
                <SearchBar/>
            </div>
            <button
                className="cursor-pointer border rounded-3xl hover:bg-slate-700 p-2"
                onClick={openModal}
            >
                <UserRound size="24"/>
            </button>
        </header>);
}
