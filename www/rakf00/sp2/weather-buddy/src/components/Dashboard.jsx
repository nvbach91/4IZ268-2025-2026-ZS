import WeatherInfoCard from "./WeatherInfo.jsx";
import AIRecommendation from "./AIRecommendation.jsx";
import DefaultLocation from "./DefaultLocation.jsx";
import SideBar from "./SideBar.jsx";

export default function Dashboard() {

    return (
            <main className='grid grid-cols-[70%_30%] w-full gap-5'>
                <div className='flex flex-col gap-4'>
                    <WeatherInfoCard/>
                    <div className='grid grid-cols-3 w-full gap-5'>
                        <AIRecommendation/>
                        <DefaultLocation/>
                    </div>
                </div>
                <SideBar/>
            </main>
    );

}
