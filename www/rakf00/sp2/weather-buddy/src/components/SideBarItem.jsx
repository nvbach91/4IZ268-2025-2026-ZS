import WeatherIcon from "./WeatherIcon.jsx";

export default function SideBarItem({day, ...props}) {
    return (
    <div className='grid grid-cols-4 place-items-center' {...props}>
        <p className='text-gray-200'>Tuesday</p>
        <WeatherIcon code={day.weatherCode} width='40' sidebar />
        <p className='text-lg'><strong>{day.temperatureMax}&#176;</strong>/{day.temperatureMin}&#176;</p>
    </div>)
}
