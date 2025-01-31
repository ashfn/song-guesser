import AsyncSelect from 'react-select/async';
import { searchAlbums } from './fetchers';
import { debounce } from '../util/debounce';
import { useEffect, useState } from 'react';
import { use } from 'react';
import useGameData from '../game/game';
import { useErrorStore } from '../game/errors';

import AlbumPicker from './AlbumPicker';
import Select from 'react-select';
import ArtistPicker from './ArtistPicker';
import PlaylistPicker from './PlaylistPicker';

const Picker = ({}) => {

    // const pickerOptions = [
    //     {
    //         value: {
    //             name: "Album",
    //             description: "Pick an album and a random song will be chosen",
    //             picker: AlbumPicker
    //         },
    //         label: "Album"
    //     },
    //     {
    //         value: {
    //             name: "Artist",
    //             description: "Pick an artist and one of their songs will be chosen",
    //             picker: AlbumPicker
    //         },
    //         label: "Artist"
    //     }
    // ]

    const [currentPicker, setCurrentPicker] = useState(null);
    // 0 = picking picker
    // 1 = picking {x} (e.g. picking artist or picking album etc)

    const updatePicker = (choice) => {
        setCurrentPicker(choice.value)
        setStage(1)
    }

    const [pickerElement, setPickerElement] = useState(null);


    return (

        <div>
            {currentPicker == null &&
                <div className='mt-8 items-center justify-center flex flex-col'>
                    <h2 className='font-unbounded text-md mb-2'>Choose a gamemode</h2>

                    <button onClick={() => setCurrentPicker("album")} className='w-[80%] border-white rounded-md py-4 items-center justify-center flex flex-col hover:bg-white hover:text-zinc-950'>
                        <span className='font-unbounded text-lg font-bold'>Album</span>
                        <span className='font-unbounded text-xs'>Select an album and a random song will be chosen</span>
                    </button>
                    <button onClick={() => setCurrentPicker("artist")} className='w-[80%] border-white rounded-md py-4 items-center justify-center flex flex-col hover:bg-white hover:text-zinc-950'>
                        <span className='font-unbounded text-lg font-bold'>Artist</span>
                        <span className='font-unbounded text-xs'>All of the artist's songs will be eligible to be chosen</span>
                    </button>
                    <button onClick={() => setCurrentPicker("playlist")} className='w-[80%] border-white rounded-md py-4 items-center justify-center flex flex-col hover:bg-white hover:text-zinc-950'>
                        <span className='font-unbounded text-lg font-bold'>Playlist</span>
                        <span className='font-unbounded text-xs'>A random song in the playlist will be chosen</span>
                    </button>
                </div>

            }
            {(currentPicker != null && currentPicker=="album") &&
                <div>
                    <AlbumPicker />
                    <div className='items-center justify-center flex flex-col mt-4'>
                        <button onClick={() => setCurrentPicker(null)} className='font-unbounded text-xs'><u>back</u></button>
                    </div>
                </div>
            }
            {(currentPicker != null && currentPicker=="artist") &&
                <div>
                    <ArtistPicker />
                    <div className='items-center justify-center flex flex-col mt-4'>
                        <button onClick={() => setCurrentPicker(null)} className='font-unbounded text-xs'><u>back</u></button>
                    </div>
                </div>
            }
            {(currentPicker != null && currentPicker=="playlist") &&
                <div>
                    <PlaylistPicker />
                    <div className='items-center justify-center flex flex-col mt-4'>
                        <button onClick={() => setCurrentPicker(null)} className='font-unbounded text-xs'><u>back</u></button>
                    </div>
                </div>
            }

        </div>
            
    )
}

// {stage === 0 &&
//     <div className='text-black'>
//         <Select options={pickerOptions} onChange={((choice) => {
//             updatePicker(choice.value)
//         })}/>
//     </div>
// }
// {stage === 1 &&
//     <div>
//         <button onClick={() => setStage(0)}>back</button>
//         <div>
//             {JSON.stringify(currentPicker)}
//             {/* <currentPicker.picker /> */}
//         </div>  
//     </div>
// }

export default Picker;