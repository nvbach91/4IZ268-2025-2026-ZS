import React from 'react';

export default function Input({ label,type = "number", name, className = "", id, registration, ...props }) {

    if (type === "radio") {
        return (
            <input
                id={id}
                type='radio'
                name={name}
                {...registration}
                className={`absolute opacity-0 ${className} peer`}
                {...props}
            />
        );
    }
    //standardní inputy
    return (
        <label htmlFor={id} className='mb-4 block font-bold'>
            {label}
            <input
                id={id}
                type={type}
                name={name}
                {...registration}
                className={`mt-1 block w-full rounded-md border border-gray-400 bg-white text-black p-2 ${className}`}
                {...props}
            />
        </label>
    );
}