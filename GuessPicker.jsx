import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';

const GuessPicker = () => {
    const [currentGuess, setCurrentGuess] = useState(null);
    const [error, setError] = useState('');
    const [buttonClass, setButtonClass] = useState('bg-spotify-green');

    const flashButtonRed = () => {
        setButtonClass('bg-red-500');
        setTimeout(() => {
            setButtonClass('bg-spotify-green');
            setTimeout(() => {
                setButtonClass('bg-red-500');
                setTimeout(() => {
                    setButtonClass('bg-spotify-green');
                }, 500);
            }, 500);
        }, 500);
    };

    const guess = () => {
        // Your guess logic here
        flashButtonRed();
    };

    const skip = () => {
        // Your skip logic here
    };

    return (
        <div className='flex flex-row items-center space-x-2 justify-center'>
            <span className='font-unbounded text-md'>Guess the track ({5-stage} left)</span>
            <AsyncSelect className='w-[50%]' cacheOptions loadOptions={loadOptions} defaultOptions={defaultOptions} formatOptionLabel={formatLabel} onChange={(choice) => {
                setCurrentGuess(choice.value);
            }} />
            {currentGuess &&
                <div className='flex flex-row w-[50%] space-x-2'>
                    <button className={`basis-[60%] flex-grow ${buttonClass} py-2 rounded-lg text-black mt-2 font-unbounded font-bold`} onClick={guess}>Guess</button>
                    <button className='basis-[30%] flex-grow bg-zinc-800 py-2 rounded-lg text-white mt-2 font-unbounded font-bold' onClick={skip}>Skip</button>
                </div>
            }
            {currentGuess == null &&
                <button className='w-[50%] bg-zinc-800 py-2 rounded-lg text-white mt-2 font-unbounded font-bold' onClick={skip}>Skip</button>
            }
            <div>{error}</div>
        </div>
    );
};

export default GuessPicker;