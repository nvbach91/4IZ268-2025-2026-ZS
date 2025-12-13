import WeatherIcon from "./WeatherIcon.jsx";
import useStoreSettings from "../store/useStoreSettings.jsx";

export default function SideBarItem({day,className, ...props}) {

    const location = useStoreSettings(state => state.settings.location);

    const getDay = (timeZone, date) => {
        return new Date(date).toLocaleString("en-US", {
            timeZone,
            weekday: "short",
        });
    }

    return (
        <div className={`grid grid-cols-4 place-items-center border-b border-b-slate-600 ${className}`} {...props}>
        <p className='text-gray-200 justify-self-start'>{getDay(location.timeZone,day.date)}</p>
        <WeatherIcon code={day.weatherCode} width='40' sidebar />
        <p className='text-lg'><strong>{day.temperatureMax}&#176;</strong>/{day.temperatureMin}&#176;</p>
    </div>)
}
