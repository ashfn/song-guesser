import AsyncSelect from 'react-select/async';
import { searchAlbums } from './fetchers';
import { debounce } from '../util/debounce';
import { useEffect, useState } from 'react';
import { use } from 'react';
import useGameData from '../game/game';
import { useErrorStore } from '../game/errors';

const AlbumPicker = ({}) => {

    const loadOptions = (
        inputValue,
        callback
      ) => {
        searchAlbums(inputValue).then((data) => {
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

    const startGameWithAlbum = useGameData((state) => state.startGameWithAlbum);

    const formatLabel = (option) => {
        const album = option.value
        return (
        <div className="flex flex-row items-center space-x-2 text-black">
            <img src={album.images[0].url} width={40} height={40} />
            <div>
                {album.name}
                <div>
                   {album.artists.map(artist => artist.name).join(', ')}
                </div>
            </div>
        </div>
        )
    }

    const error = useErrorStore((state) => state.error);

    return (
        <div className='items-center justify-center flex flex-col mt-8'>
            <div className='flex flex-row items-center space-x-2 justify-center'>
                <span className='font-unbounded text-md'>Pick an album</span>
            </div>
            <AsyncSelect placeholder="Search for an album" className='md:w-[50%] w-[80%]' cacheOptions loadOptions={debouncedFetchOptions} formatOptionLabel={formatLabel} onChange={((choice) => {
                setAlbum(choice.value)
            })} />
            {album &&
                <button className='md:w-[25%] w-[50%] bg-spotify-green py-2 rounded-lg text-black mt-2 font-unbounded font-bold' onClick={() => {
                    startGameWithAlbum(album)
                }}>Start game</button>
            }
            <div>{error}</div>
        </div>
    )
}

export default AlbumPicker;