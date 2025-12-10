import {Droplets, Thermometer, Wind} from "lucide-react";
import Icon from "../assets/images/icons/rain.png";
import WeatherInfoSlider from "./WeatherInfoSlider.jsx";

export default function WeatherInfoCard({location, weatherData}) {

    return (
        <div>
            <div className='weather-info-card flex items-center'>
                <div className='flex items-center gap-4 min-w-0'>
                    <img src={Icon} width='180' alt='actualWeatherIcon'/>
                    <div><h1 className='text-5xl leading-tight break-normal whitespace-normal'>{location.name}</h1>
                        <p>{location.country}</p>
                    </div>
                </div>
                <div className='flex justify-end gap-6 w-full whitespace-nowrap'>
                    <div className='flex items-center'><Thermometer/><h2 className='text-3xl'>18 &#176;C</h2></div>
                    <div className='flex items-center'><Droplets/><h2 className='text-3xl'>12 %</h2></div>
                    <div className='flex items-center'><Wind/><h2 className='text-3xl'>&nbsp;3 m/s</h2></div>
                </div>
            </div>
            <WeatherInfoSlider nextHours={[1,2,3,4,5,6]}/>
        </div>
    );
}