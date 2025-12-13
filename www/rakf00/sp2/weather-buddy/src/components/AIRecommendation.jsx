import Button from "./Button.jsx";
import useAIRecommendation from "../hooks/useAIRecommendation.jsx";
import {Spinner} from "./Spinner.jsx";

export default function AIRecommendation({weatherData}) {
    const {isGenerating, isGenerated, getRecommendation, recommendationText} = useAIRecommendation(weatherData);

    return (
        <form className='bg-slate-700 rounded-xl col-span-2'>
            <h2 className='text-center text-2xl mt-4'>Looking for advice?</h2>
            {isGenerating && (
                <div className='flex justify-center items-center py-8'>
                    <Spinner/>
                </div>
            )}
            {isGenerated && !isGenerating && (
                <div className='m-4 p-4 bg-slate-600 rounded-xl text-lg'>
                    {recommendationText}
                </div>
            )}
            {!isGenerated && !isGenerating && (
                <Button
                    name='Generate recommendation'
                    className='text-xl p-4 mx-auto block mt-8'
                    onClick={(e) => {
                        e.preventDefault();
                        getRecommendation();
                    }}
                />
            )}
        </form>
    );
}
