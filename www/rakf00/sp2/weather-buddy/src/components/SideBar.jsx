import Icon from "../assets/images/icons/sun.png"

export default function SideBar() {
    return (
        <div className='rounded-2xl bg-slate-700 p-8'>
            <p className='uppercase text-gray-300 font-bold'>6-DAY forecast</p>
            <div className='line-cards grid grid-rows-6 h-full'>
                {Array(6).fill(null).map((_, i) => (
                    <div key={i} className='HorizontalWeatherCard flex items-center justify-between'>
                        <p className='text-gray-200'>Tuesday</p>
                        <div className='flex items-center gap-4'>
                            <img src={Icon} width='48' alt='dayWeatherIcon'/>
                            <p className='font-bold'>Sunny</p>
                        </div>
                        <p><strong>25</strong>/12</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
