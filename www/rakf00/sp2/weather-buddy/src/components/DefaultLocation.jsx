import Icon from "../assets/images/icons/storm.png";

export default function DefaultLocation() {
    return (
        <div className='defaultLocationWeather flex flex-col gap-4 items-center bg-slate-700 rounded-xl cursor-pointer'>
            <h2 className='text-center text-2xl pt-4'>Prague</h2>
            <img src={Icon} width='72' alt='weatherInYourFavouriteLocationPicture'/>
            <p className='font-bold text-xl'>10 &#176; C</p>
        </div>
    )}
