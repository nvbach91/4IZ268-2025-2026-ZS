import Input from "./Input.jsx";
import Button from "./Button.jsx";
import {X} from "lucide-react";

export default function ProfileModal({closeModal}) {
    return (<div id='modal-backdrop'
                 className='fixed inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm'>

        <div role='dialog' aria-modal='true'
             className='relative p-6 z-20 w-100 max-w-lg bg-white border-2  text-black rounded-xl shadow-2xl transform transition-all duration-300'>
            <h3 className='text-xl font-bold  my-4 text-center'>Profile settings</h3>
            <Input defaultValue='25' min='0' name='age' type='number' placeholder='Age' label='Age'/>
            <Input defaultValue='175' name='height' min='0' type='number' placeholder='Height in cm'
                   label='Height'/>
            <Input defaultValue='80' min='0' name='weight' type='number' placeholder='Weight in kg' label='Weight'/>
            <p className='flex justify-between mb-1'><span className='font-bold'>Cold sensitivity</span><span className='text-gray-500'>* 10 high sensitivity</span></p>
            <div className='grid grid-cols-10 gap-2 mb-8 relative'>
                {[...Array(10)].map((_, i) => (
                    <div key={i} className='relative'>
                        <Input
                            id={`radio-${i}`}
                            type='radio'
                            name='rating'
                            defaultValue={i + 1}
                        />
                        <label
                            htmlFor={`radio-${i}`}
                            className='radio-card flex flex-col items-center justify-center border border-black rounded-sm cursor-pointer p-3 transition-colors duration-200
                peer-checked:bg-black peer-checked:text-white'
                        >
                            <p>{i + 1}</p>
                        </label>

                    </div>
                ))}
            </div>
            <Button name='Save' className='bg-blue-600 hover:bg-blue-700 block mx-auto w-40 text-xl'/>
            <X onClick={closeModal} size='26' className='absolute cursor-pointer hover:scale-105 top-3 right-4'/>
        </div>
    </div>)
}
