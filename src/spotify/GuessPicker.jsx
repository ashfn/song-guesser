import AsyncSelect from 'react-select/async';
import { searchAlbums } from './fetchers';
import { debounce } from '../util/debounce';
import { useRef, useState } from 'react';
import { use } from 'react';
import useGameData from '../game/game';
import { useErrorStore } from '../game/errors';
function calculateSearchRelevance(str, searchTerm) {
    // Convert both to lowercase for case-insensitive comparison
    str = str.toLowerCase();
    searchTerm = searchTerm.toLowerCase();
    
    // Highest priority: starts with the search term
    if (str.startsWith(searchTerm)) {
        return 3;
    }
    
    // Second priority: contains the search term as a whole word
    if (str.includes(' ' + searchTerm) || str === searchTerm) {
        return 2;
    }
    
    // Lowest priority: contains the search term somewhere
    if (str.includes(searchTerm)) {
        return 1;
    }
    
    // No match
    return 0;
}

function sortBySearchRelevance(array, searchTerm) {
    return array.sort((a, b) => {
        const scoreA = calculateSearchRelevance(`${a.name} ${a.artists}`, searchTerm) + calculateSearchRelevance(`${a.name.replace(/\W/g, '')} ${a.artists.replace(/\W/g, '')}`, searchTerm);
        const scoreB = calculateSearchRelevance(`${b.name} ${b.artists}`, searchTerm)+ calculateSearchRelevance(`${a.name.replace(/\W/g, '')} ${a.artists.replace(/\W/g, '')}`, searchTerm);;
        
        // Sort by relevance score (higher first)
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        
        // If scores are equal, sort by string length (shorter first)
        return a.name.length - b.name.length;
    });
}

const GuessPicker = ({}) => {

    const options = useGameData((state) => state.potentialSongs);


    const defaultOptions = options.map((item) => {
        return {
            value: item,
            label: item.name
        }
    })

    const loadOptions = (
        inputValue,
        callback
      ) => {
        console.log(`sorting by ${inputValue}`)
        const sortedOptions = sortBySearchRelevance (options, inputValue);
        const rData = []
        sortedOptions.forEach((item) => {
            rData.push({
                value: item,
                label: item.name
            })
        })
        callback(rData)
      };

    const [currentGuess, setCurrentGuess] = useState(null);

    const formatLabel = (option) => {
        const album = option.value
        return (
        <div className="flex flex-row items-center space-x-2 text-black">
            <img src={album.image} width={40} height={40} />
            <div>
                {album.name}
                <div>
                   {album.artists}
                </div>
            </div>
        </div>
        )
    }

    const error = useErrorStore((state) => state.error);

    const song = useGameData((state) => state.song);    

    const incorrectGuess = useGameData((state) => state.incorrectGuess);

    const stage = useGameData((state) => state.stage);

    const setWon = useGameData((state) => state.setWon);
    const setLost = useGameData((state) => state.setLost);

    const guess = () => {
        if(song.id == currentGuess.id){
            setWon()
        }else{
            console.log('incorrect')
            flashButtonRed()
        }
    }

    const skip = () => {
        selectRef.current.clearValue();
        incorrectGuess()
    }

    const [buttonClass, setButtonClass] = useState('bg-spotify-green');

    const flashButtonRed = () => {
        setButtonClass('bg-red-500');
        setTimeout(() => {
            setButtonClass('bg-spotify-green');
            selectRef.current.clearValue();
            incorrectGuess()
        }, 500);
    };

    const selectRef = useRef(null);

    return (
        <div className='items-center justify-center flex flex-col mt-4'>
            <div className='flex flex-row items-center space-x-2 justify-center'>
                <span className='font-unbounded text-md'>Guess the track ({5-stage} left)</span>
            </div>
            <AsyncSelect ref={selectRef} className='md:w-[50%] w-[80%]' cacheOptions loadOptions={loadOptions} defaultOptions={defaultOptions} formatOptionLabel={formatLabel}   onChange={((choice) => {
                if (choice) {
                    setCurrentGuess(choice.value)
                } else {
                    setCurrentGuess(null)
                }
            })}  />

            {currentGuess &&
                <div className='flex flex-row md:w-[50%] w-[80%] space-x-2'>
                    <button className={`basis-[60%] ${buttonClass} flex-grow bg-spotify-green py-2 rounded-lg text-black mt-2 font-unbounded font-bold`} onClick={() => {
                        guess()
                    }}>Guess</button>
                    <button className='basis-[30%] flex-grow bg-zinc-800 py-2 rounded-lg text-white mt-2 font-unbounded font-bold' onClick={() => {
                    skip()
                    }}>Skip</button>  
                </div>


            }
            {currentGuess==null &&
                <button className='w-[50%] bg-zinc-800 py-2 rounded-lg text-white mt-2 font-unbounded font-bold' onClick={() => {
                skip()
                }}>Skip</button>  
            }
            <div>{error}</div>
        </div>
    )
}

export default GuessPicker;