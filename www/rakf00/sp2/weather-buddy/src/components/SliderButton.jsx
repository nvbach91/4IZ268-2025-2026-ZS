import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SliderButton({ direction, onClick, disabled }) {

    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    const position = direction === 'left' ? 'left-2' : 'right-2';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`absolute ${position} top-1/2 -translate-y-1/2 p-1 z-20
                       transition-all duration-300 hover:scale-110
                       ${disabled ? 'opacity-0' : ' opacity-100 cursor-pointer'}`}
        >
            <Icon size={32} className="text-white" />
        </button>
    );
}