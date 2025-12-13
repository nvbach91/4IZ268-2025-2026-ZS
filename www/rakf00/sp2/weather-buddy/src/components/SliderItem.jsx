import Icon from "../assets/images/icons/rain.png";
import WeatherIcon from "./WeatherIcon.jsx";

export default function SliderItem({hourData}) {



    return (
        <div
            className='flex-shrink-0 flex flex-col gap-4 items-center px-2 border-r border-slate-600'
        >
            <p className='font-bold text-gray-300'>
                {hourData.time ?? '--'}
            </p>
            <WeatherIcon code={hourData.weatherCode} className='drop-shadow-md'/>
            <p className='font-bold text-xl'>
                {hourData.temperature ?? '--'} &#176;C
            </p>
        </div>
    );
}