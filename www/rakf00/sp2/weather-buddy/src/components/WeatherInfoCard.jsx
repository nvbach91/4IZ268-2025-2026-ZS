import {Droplets, Thermometer, Wind} from "lucide-react";
import Slider from "./Slider.jsx";
import {weatherMapper} from "../utils/weatherCodeManager.js";
import WeatherIcon from "./WeatherIcon.jsx";

export default function WeatherInfoCard({location, weatherData}) {
    return (
        <div>
            <div className='weather-info-card flex items-center'>
                <div className='flex items-center gap-4 min-w-0'>
                    <WeatherIcon width='180' code={weatherData.weatherCode}/>
                    <div>
                        <h1 className='text-5xl leading-tight break-normal whitespace-normal'>
                            {location.name}
                        </h1>
                        <p>{location.country}</p>
                    </div>
                </div>
                <div className='flex justify-end gap-6 w-full whitespace-nowrap'>
                    <div className='flex flex-col gap-4 items-center'>
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
                    <div className='flex flex-col gap-4 items-center'>
                        <h3 className='font-semibold tracking-wide text-gray-300'>
                            Humidity
                        </h3>
                        <div className='flex items-center gap-1'>
                            <Droplets/>
                            <h2 className='text-3xl'>{weatherData.humidity ?? "--"} %</h2>
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 items-center'>
                        <h3 className='font-semibold tracking-wide text-gray-300'>Wind</h3>
                        <div className='flex items-center gap-1'>
                            <Wind/>
                            <h2 className='text-3xl'>{weatherData.windSpeed ?? "--"} m/s</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
