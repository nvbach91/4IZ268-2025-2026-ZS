import {weatherMapper} from "../utils/weatherCodeManager.js";

export default function WeatherIcon({code, width = 48, sidebar = false, ...props}) {
    const data = weatherMapper(code);

    return (
        <>
            <img src={data.img} width={width} {...props} alt={data.alt}/>
            {sidebar && <p className='font-bold text-gray-100'>{data.label}</p>}
        </>
    );
}
