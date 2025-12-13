import WeatherInfoCard from "./WeatherInfoCard.jsx";
import AIRecommendation from "./AIRecommendation.jsx";
import DefaultLocation from "./DefaultLocation.jsx";
import SideBar from "./SideBar.jsx";
import useWeatherFetch from "../hooks/useWeatherFetch.jsx";
import useStoreSettings from "../store/useStoreSettings.jsx";
import {Spinner} from "./Spinner.jsx";

export default function Dashboard() {

    const {weatherData, isLoading}= useWeatherFetch();

    const location = useStoreSettings(state => state.settings.location);

    if (isLoading) {
        return (
               <Spinner className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        );
    }
    return (
            <main className='grid grid-cols-[70%_30%] w-full gap-5'>
                <div className='flex flex-col gap-4'>
                    <WeatherInfoCard location={location} weatherData={weatherData.current} />
                    <div className='grid grid-cols-3 w-full gap-5'>
                        <AIRecommendation/>
                        <DefaultLocation/>
                    </div>
                </div>
                <SideBar weatherData={weatherData.daily}/>
            </main>
    );

}
