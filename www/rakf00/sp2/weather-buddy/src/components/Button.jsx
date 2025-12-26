export default function Button({ name, className="", ...props }) {
    return (
        <button
            {...props}
            className={`cursor-pointer p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition ${className}`}
        >
            {name}
        </button>
    )
}
