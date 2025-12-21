import SearchBar from "./SearchBar.jsx";
import { UserRound } from "lucide-react";

export default function Header({ openModal }) {
  return (
    <header className="relative z-50 w-full flex items-center justify-end">
      <div className="absolute left-1/2 -translate-x-1/2 z-50">
        <SearchBar />
      </div>
      <button
        className="cursor-pointer border rounded-3xl hover:bg-slate-700 p-2"
        onClick={openModal}
      >
        <UserRound size="24" />
      </button>
    </header>
  );
}
