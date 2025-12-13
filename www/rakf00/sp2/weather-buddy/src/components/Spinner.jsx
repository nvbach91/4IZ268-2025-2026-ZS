export const Spinner = ({className}) => {
    return (
        <div className={`w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} />
    );
}