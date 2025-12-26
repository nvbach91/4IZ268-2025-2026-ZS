import useSearchBar from "../hooks/useSearchBar.jsx";
import useWeatherFetch from "../hooks/useWeatherFetch.jsx";
import WeatherIcon from "./WeatherIcon.jsx";
import {Spinner} from "./Spinner.jsx";

export default function DefaultLocation({defaultLocation, ...props}) {
    const {selectLocation} = useSearchBar();
    const {weatherData, isLoading} = useWeatherFetch(defaultLocation);

    if (isLoading) {
        return (
            <div className='defaultLocationWeather flex flex-col gap-4 items-center bg-slate-700 rounded-xl p-4'>
                <h2 className='text-center text-2xl'>{defaultLocation.name}</h2>
                <Spinner/>
            </div>
        );
    }

    const temperature = Math.round(weatherData.current.temperature);
    const weatherCode = weatherData.current.weatherCode;

    return (
        <div
            className='defaultLocationWeather flex flex-col gap-4 items-center bg-slate-700 rounded-xl cursor-pointer p-4'
            onClick={() => selectLocation(defaultLocation)}
            {...props}
        >
            <h2 className='text-center text-2xl'>{defaultLocation.name}</h2>
            <WeatherIcon code={weatherCode} width={72}/>
            <p className='font-bold text-xl'>{temperature} &#176;C</p>
        </div>
    );
}
