import {weatherMapper} from "../utils/weatherCodeManager.js";

export default function WeatherIcon({code, width = 48, sidebar = false, ...props}) {
    const data = weatherMapper(code);

    if (sidebar) {
        return (
            <>
                <img src={data.img} width={width} {...props} alt={data.alt}/>
                <p className='font-bold'>{data.label}</p>
            </>
        )
    }

    return (
        <img src={data.img} width={width} {...props} alt={data.alt}/>
    );
}
