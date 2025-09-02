import AsyncSelect from 'react-select/async';
import { searchAlbums, searchArtists, searchPlaylists } from './fetchers';
import { debounce } from '../util/debounce';
import { useState } from 'react';
import { use } from 'react';
import useGameData from '../game/game';
import { useErrorStore } from '../game/errors';

const PlaylistPicker = ({}) => {

    const loadOptions = (
        inputValue,
        callback
      ) => {
        searchPlaylists(inputValue).then((data) => {
            console.log(data)
            const rData = []
            data.forEach((item) => {
                if(item!=null){
                    rData.push({
                        value: item,
                        label: item.name
                    })
                }
            })
          callback(rData);
        });
      };

    const debouncedFetchOptions = debounce(loadOptions, 400);

    const [album, setAlbum] = useState(null);

    const startGameWithPlaylist = useGameData((state) => state.startGameWithPlaylist);

    const formatLabel = (option) => {
        const playlist = option.value
        return (
        <div className="flex flex-row items-center space-x-2 text-black">

            <img src={playlist.images.length>0?playlist.images[0].url:""} width={40} height={40} />
            <div>
                {playlist.name}
                <div>
                   {playlist.tracks.total} tracks
                </div>
            </div>
        </div>
        )
    }

    const error = useErrorStore((state) => state.error);

    return (
        <div className='items-center justify-center flex flex-col mt-8'>
            <div className='flex flex-row items-center space-x-2 justify-center'>
                <span className='font-unbounded text-md'>Pick a playlist</span>
            </div>
            <AsyncSelect placeholder="Search for a playlist" className='md:w-[50%] w-[80%]' cacheOptions loadOptions={debouncedFetchOptions} formatOptionLabel={formatLabel} onChange={((choice) => {
                setAlbum(choice.value)
            })} />
            {album &&
                <button className='md:w-[25%] w-[50%] bg-spotify-green py-2 rounded-lg text-black mt-2 font-unbounded font-bold' onClick={() => {
                    startGameWithPlaylist(album)
                }}>Start game</button>
            }
            <div>{error}</div>
        </div>
    )
}

export default PlaylistPicker;