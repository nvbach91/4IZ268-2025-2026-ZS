import Icon from "../assets/images/icons/sun.png"
import WeatherIcon from "./WeatherIcon.jsx";
import SideBarItem from "./SideBarItem.jsx";

export default function SideBar({weatherData}) {
    return (
        <div className='rounded-2xl bg-slate-700 p-8'>
            <p className='uppercase text-gray-300 font-bold'>6-DAY forecast</p>
            <div className='line-cards grid grid-rows-6 h-full'>
                {weatherData.map((day, index) => {
                    return (
                        <SideBarItem key={index} day={day}/>
                    )
                })}
            </div>
        </div>
    )
}
