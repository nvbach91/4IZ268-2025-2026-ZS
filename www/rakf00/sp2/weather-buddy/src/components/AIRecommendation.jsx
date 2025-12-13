import Button from "./Button.jsx";

export default function AIRecommendation() {
    return (
        <form className='AIRecomendation bg-slate-700 rounded-xl col-span-2'>
            <h2 className='text-center text-2xl mt-4'>Looking for advice?</h2>
            <textarea className='hidden' name='' id='' cols='30' rows='10' contentEditable='false'></textarea>
            <Button name='Generate recommendation'
                    className='text-xl p-4 mx-auto block mt-8'/>
        </form>
    )
}
