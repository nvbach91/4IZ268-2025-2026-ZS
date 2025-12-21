import {Droplets, Star, Thermometer, Wind} from "lucide-react";
import WeatherIcon from "./WeatherIcon.jsx";
import useStar from "../hooks/useStar.jsx";

export default function WeatherInfoCard({location, weatherData}) {
    const {isDefault, handleStarClick, removeDefaultLocation} = useStar(location);

    return (<div className='weather-info-card flex items-center justify-between'>
        <div className='flex flex-col gap-8'>
            <div>
                <h1 className='text-6xl leading-tight w-fit relative'>
                    {location.name}
                    <Star size='30' fill={isDefault ? "yellow" : ""}
                          onClick={isDefault ? removeDefaultLocation : handleStarClick}
                          className={`absolute top-[-20px] right-[-25px] cursor-pointer transition delay-75 ease-in ${!isDefault && "hover:fill-white/80"}`}/>
                </h1>
                <p>{location.country}</p>
            </div>
            <div className='flex gap-10'>
                <div className='flex flex-col gap-4'>
                    <h3 className='font-semibold tracking-wide text-gray-300'>
                        Temperature
                    </h3>
                    <div className='flex items-center'>
                        <Thermometer/>
                        <h2 className='text-3xl'>
                            {weatherData.temperature ?? "--"} &#176;C
                        </h2>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <h3 className='font-semibold tracking-wide text-gray-300'>
                        Humidity
                    </h3>
                    <div className='flex items-center gap-1'>
                        <Droplets/>
                        <h2 className='text-3xl'>{weatherData.humidity ?? "--"} %</h2>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <h3 className='font-semibold tracking-wide text-gray-300'>Wind</h3>
                    <div className='flex items-center gap-1'>
                        <Wind/>
                        <h2 className='text-3xl'>{weatherData.windSpeed ?? "--"} m/s</h2>
                    </div>
                </div>
            </div>
        </div>
        <WeatherIcon width='180' className='' code={weatherData.weatherCode}/>
    </div>);
}
