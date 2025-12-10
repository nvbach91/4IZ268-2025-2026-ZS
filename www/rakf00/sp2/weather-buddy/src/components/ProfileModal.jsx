import Input from "./Input.jsx";
import Button from "./Button.jsx";
import {X} from "lucide-react";
import useStoreSettings from "../store/useStoreSettings.jsx";
import {useForm} from "react-hook-form";

export default function ProfileModal({closeModal}) {
    //když kliknu do modalu nezavře se
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    const updateSettings = useStoreSettings((state) => state.updateSettings);

    const settings = useStoreSettings((state) => state.settings);

    // integruju s RHF a nastavuju default values ze zustandu
    const {
        register, handleSubmit, formState: {errors} } = useForm({
        defaultValues: settings
    });

    const onSubmit = (data) => {
        updateSettings(data);
        closeModal();
    };

    return (
        <div
        id='modal-backdrop'
        onClick={closeModal}
        className='cursor-pointer fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'
    >
        <div
            role='dialog'
            aria-modal='true'
            onClick={handleModalClick}
            className='relative cursor-default p-6 w-100 max-w-lg bg-white border-2  text-black rounded-xl shadow-2xl transform transition-all duration-300'
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className='text-xl font-bold  my-4 text-center'>
                    Profile settings
                </h3>
                <Input
                    min='0'
                    name='age'
                    placeholder='Age'
                    label='Age'
                    registration={register("age", {
                        required: "Field is required", min: {
                            value: 1, message: "Age must be positive number",
                        }, max: {
                            value: 100, message: "Max age is 1OO, if you are older, do not go outside",
                        }, valueAsNumber: true,
                    })}
                />
                {errors.age && (<p className='text-red-500 text-sm mt-[-10px] mb-2'>
                    {errors.age.message}
                </p>)}
                <Input
                    name='height'
                    min='1'
                    placeholder='Height in cm'
                    label='Height'
                    registration={register("height", {
                        required: "Field is required", min: {
                            value: 1, message: "Height be positive number",
                        }, max: {
                            value: 230, message: "Max height is 230cm, if you are taller, get a surgery",
                        }, valueAsNumber: true,
                    })}
                />
                {errors.height && (<p className='text-red-500 text-sm mt-[-10px] mb-2'>
                    {errors.height.message}
                </p>)}
                <Input
                    min='0'
                    name='weight'
                    placeholder='Weight in kg'
                    label='Weight'
                    registration={register("weight", {
                        required: "Field is required", min: {
                            value: 1, message: "Weight must be positive number",
                        }, max: {
                            value: 200, message: "Max weight is 200, are you a whale?",
                        }, valueAsNumber: true,
                    })}
                />
                {errors.weight && (<p className='text-red-500 text-sm mt-[-10px] mb-2'>
                    {errors.weight.message}
                </p>)}
                <p className='flex justify-between mb-1'>
                    <span className='font-bold'>Cold sensitivity</span>
                    <span className='text-gray-500'>* 10 high sensitivity</span>
                </p>
                <div className='grid grid-cols-10 gap-2 relative'>
                    {[...Array(10)].map((_, i) => (<div key={i} className='relative'>
                        <Input
                            id={`radio-${i+1}`}
                            type='radio'
                            name='sensitivity'
                            registration={register("sensitivity", {
                                required: "How cold sensitive are you?",
                            })}
                            value={i + 1}
                        />
                        <label
                            htmlFor={`radio-${i+1}`}
                            className='radio-card flex flex-col items-center justify-center border border-black rounded-sm cursor-pointer p-3 transition-colors duration-200
                                            peer-checked:bg-black peer-checked:text-white'
                        >
                            <p>{i + 1}</p>
                        </label>
                    </div>))}
                </div>
                {errors.sensitivity && (<p className='text-red-500 text-sm  my-2'>
                    {errors.sensitivity.message}
                </p>)}
                <Button
                    name='Save'
                    type='submit'
                    className='bg-blue-600 hover:bg-blue-700 block mx-auto w-40 text-xl mt-4'
                />
            </form>
            <X
                onClick={closeModal}
                size='26'
                className='absolute cursor-pointer hover:scale-105 top-3 right-4'
                visibility={settings ? "visible" : "hidden"}
            />
        </div>
    </div>);
}
