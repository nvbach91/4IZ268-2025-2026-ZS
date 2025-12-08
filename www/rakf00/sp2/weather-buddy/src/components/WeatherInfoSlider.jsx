import Icon from "../assets/images/icons/rain.png";

export default function WeatherInfoSlider() {

    return (
        <div className='slider p-10 bg-slate-700 rounded-xl mt-10'>
            <p className='mb-4 uppercase text-gray-300 font-bold'>Today's Forecast</p>
            <div className='grid grid-cols-6'> {[...Array(6)].map((_, index) => (
                <div key={index} className='time-card text-white flex flex-col gap-4 items-center'>
                    <p className='font-bold text-gray-300'>6:00</p>
                    <img src={Icon} width='48' alt='actualWeatherIcon'/>
                    <p className='font-bold text-xl'>5 &#176;C</p>
                </div>))}</div>
        </div>
    )
}