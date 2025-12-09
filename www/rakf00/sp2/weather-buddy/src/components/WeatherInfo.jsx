import {Droplets, Thermometer, Wind} from "lucide-react";
import Icon from "../assets/images/icons/rain.png";
import WeatherInfoSlider from "./WeatherInfoSlider.jsx";

export default function WeatherInfo() {
    return (
        <div>
            <div className='weather-info-card flex items-center justify-between'>
                <div className='flex items-center gap-6'>
                    <img src={Icon} width='180' alt='actualWeatherIcon'/>
                    <div><h1 className='text-5xl leading-18'>Beijing</h1>
                        <p>China</p>
                    </div>
                </div>
                <div className='flex gap-6'>
                    <div className='flex items-center'><Thermometer/><h2 className='text-3xl'>18 &#176;C</h2></div>
                    <div className='flex items-center'><Droplets/><h2 className='text-3xl'>12 %</h2></div>
                    <div className='flex items-center'><Wind/><h2 className='text-3xl'>&nbsp;3 m/s</h2></div>
                </div>
            </div>
            <WeatherInfoSlider/>
        </div>
    );
}