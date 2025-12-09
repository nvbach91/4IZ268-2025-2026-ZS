import Button from "./Button.jsx";

export default function AIRecommendation() {
    return (
        <form className='AIRecomendation bg-slate-700 rounded-xl col-span-2'>
            <h2 className='text-center text-2xl pt-4'>Looking for advice?</h2>
            <label htmlFor='simpleTime' className='text-lg flex items-center gap-2 w-full justify-center mt-4'>
                What time will you go out?
                <input type='time' id='simpleTime' value='00:00'
                       className='bg-slate-600 font-mono p-3 rounded-xl border-none cursor-pointer'
                />
            </label>
            <textarea className='hidden' name='' id='' cols='30' rows='10' contentEditable='false'></textarea>
            <Button name='Generate recommendation'
                    className='text-xl p-4 mx-auto block my-4'/>
        </form>
    )
}
