import {Droplets, Thermometer, Wind} from "lucide-react";
import Icon from "../assets/images/icons/rain.png";

export default function WeatherInfoCard() {
    return (
        <div>
            <div className='weather-info-card flex items-center text-white justify-between'>
                <p className='flex items-center gap-6'>
                    <img src={Icon} width='180' alt='actualWeatherIcon'/>
                    <p><h1 className='text-5xl leading-18'>Beijing</h1>
                        <span>China</span>
                    </p>
                </p>
                <div className='flex gap-6'>
                    <p className='flex items-center'><Thermometer/><h2 className='text-3xl'>18 &#176;C</h2></p>
                    <p className='flex items-center'><Droplets/><h2 className='text-3xl'>12 %</h2></p>
                    <p className='flex items-center'><Wind/><h2 className='text-3xl'>&nbsp;3 m/s</h2></p>
                </div>
            </div>

            <div className='slider p-10 grid grid-cols-6 gap-6 bg-slate-700 rounded-xl mt-10'>
                {[...Array(6)].map((_, index) => (
                <div key={index} className='time-card text-white flex flex-col gap-4 items-center'>
                    <p className='font-bold text-gray-300'>6:00</p>
                    <img src={Icon} width='48' alt='actualWeatherIcon'/>
                    <p className='font-bold text-xl'>5 &#176;C</p>
                </div>))}
            </div>
        </div>
    )
}