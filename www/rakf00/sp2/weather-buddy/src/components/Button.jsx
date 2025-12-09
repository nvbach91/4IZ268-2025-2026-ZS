export default function Button({ name, className="", ...props }) {
    return (
        <button
            {...props}
            className={`cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-xl transition ${className}`}
        >
            {name}
        </button>
    )
}
