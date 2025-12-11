import {useSlider} from '../hooks/useSlider';
import SliderButton from './SliderButton.jsx';
import SliderItem from './SliderItem.jsx';

export default function WeatherInfoSlider({nextHours}) {


    const {
        handleNext,
        handlePrev,
        canGoNext,
        canGoPrev,
        itemWidth,
        translateX
    } = useSlider(nextHours?.length ?? 0);

    return (
        <div className='slider p-10 bg-slate-700 rounded-xl mt-10 relative group'>
            <p className='mb-4 uppercase text-gray-300 font-bold'>Today's Forecast</p>
            <SliderButton direction='left' onClick={handlePrev} disabled={!canGoPrev}/>
            <div className='overflow-hidden mx-4 relative'>
                <div className='absolute right-0 top-0 bottom-0 w-[2px] bg-slate-700 z-10 pointer-events-none'></div>
                <div
                    className='flex transition-transform duration-500 ease-in-out will-change-transform'
                    style={{transform: `translateX(${translateX}%)`}}
                >
                    {nextHours?.map((hour, index) => (
                        <div
                            key={index}
                            className='flex-shrink-0'
                            style={{width: `${itemWidth}%`}}
                        >
                            <SliderItem hourData={hour}/>
                        </div>
                    ))}

                    {(!nextHours || nextHours.length === 0) && (
                        <div className='w-full text-center text-gray-400 py-4'>
                            No data available.
                        </div>
                    )}
                </div>
            </div>
            <SliderButton direction='right' onClick={handleNext} disabled={!canGoNext}/>
        </div>
    );
}