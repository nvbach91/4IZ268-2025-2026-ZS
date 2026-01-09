import WeatherInfoCard from "./WeatherInfoCard.jsx";
import AIRecommendation from "./AIRecommendation.jsx";
import DefaultLocation from "./DefaultLocation.jsx";
import SideBar from "./SideBar.jsx";
import {useCurrentLocationWeather} from "../hooks/useWeatherFetch.jsx";
import useStoreSettings from "../store/useStoreSettings.jsx";
import {Spinner} from "./Spinner.jsx";
import Slider from "./Slider.jsx";

export default function Dashboard() {
    const {weatherData, isLoading} = useCurrentLocationWeather();

    const location = useStoreSettings((state) => state.settings.location);
    const defaultLocation = useStoreSettings(
        (state) => state.settings.defaultLocation
    );

    if (isLoading) {
        return (
            <Spinner className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'/>
        );
    }
    return (
        <main className='grid grid-cols-[70%_30%] w-full gap-5'>
            <div className='flex flex-col gap-4'>
                <WeatherInfoCard
                    location={location}
                    weatherData={weatherData.current}
                />
                <Slider weatherData={weatherData.hourly}/>
                <div className='grid grid-cols-3 w-full gap-5'>
                    <AIRecommendation weatherData={weatherData.hourly}/>
                    {!defaultLocation || defaultLocation?.id === location?.id ? (
                        ""
                    ) : (
                        <DefaultLocation defaultLocation={defaultLocation}/>
                    )}
                </div>
            </div>
            <SideBar weatherData={weatherData.daily}/>
        </main>
    );
}
