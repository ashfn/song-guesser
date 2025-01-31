import AsyncSelect from 'react-select/async';
import { searchAlbums, searchArtists } from './fetchers';
import { debounce } from '../util/debounce';
import { useState } from 'react';
import { use } from 'react';
import useGameData from '../game/game';
import { useErrorStore } from '../game/errors';

const ArtistPicker = ({}) => {

    const loadOptions = (
        inputValue,
        callback
      ) => {
        searchArtists(inputValue).then((data) => {
            console.log(data)
            const rData = []
            data.forEach((item) => {
                rData.push({
                    value: item,
                    label: item.name
                })
            })
          callback(rData);
        });
      };

    const debouncedFetchOptions = debounce(loadOptions, 400);

    const [album, setAlbum] = useState(null);

    const startGameWithArtist = useGameData((state) => state.startGameWithArtist);

    const formatLabel = (option) => {
        const artist = option.value
        return (
        <div className="flex flex-row items-center space-x-2 text-black">

            <img src={artist.images.length>0?artist.images[0].url:""} width={40} height={40} />
            <div>
                {artist.name}
                <div>
                   {/* {album.artists.map(artist => artist.name).join(', ')} */}
                </div>
            </div>
        </div>
        )
    }

    const error = useErrorStore((state) => state.error);

    return (
        <div className='items-center justify-center flex flex-col mt-8'>
            <div className='flex flex-row items-center space-x-2 justify-center'>
                <span className='font-unbounded text-md'>Pick an artist</span>
            </div>
            <AsyncSelect placeholder="Search for an artist" className='md:w-[50%] w-[80%]' cacheOptions loadOptions={debouncedFetchOptions} formatOptionLabel={formatLabel} onChange={((choice) => {
                setAlbum(choice.value)
            })} />
            {album &&
                <button className='md:w-[25%] w-[50%] bg-spotify-green py-2 rounded-lg text-black mt-2 font-unbounded font-bold' onClick={() => {
                    startGameWithArtist(album)
                }}>Start game</button>
            }
            <div>{error}</div>
        </div>
    )
}

export default ArtistPicker;