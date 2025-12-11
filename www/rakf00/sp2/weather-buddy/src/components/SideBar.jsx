import Icon from "../assets/images/icons/sun.png"

export default function SideBar({nextDays}) {
    return (
        <div className='rounded-2xl bg-slate-700 p-8'>
            <p className='uppercase text-gray-300 font-bold'>6-DAY forecast</p>
            <div className='line-cards grid grid-rows-6 h-full'>
                {nextDays.map((day, index) => (
                    <div key={index} className='HorizontalWeatherCard grid grid-cols-4 place-items-center'>
                        <p className='text-gray-200'>Tuesday</p>
                            <img src={Icon} width='48' alt='dayWeatherIcon'/>
                            <p className='font-bold'>Sunny</p>
                        <p className='text-lg'><strong>{day.temperatureMax}&#176;</strong>/{day.temperatureMin}&#176;</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
