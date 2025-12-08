import WeatherInfoCard from "../../components/WeatherInfoCard.jsx";

export default function Dashboard() {
    return (
        <div className='dashboard'>
            <main className='grid grid-cols-[70%_30%] w-full'>
                <WeatherInfoCard/>
                <div className='right border'></div>
            </main>
        </div>
    );

}