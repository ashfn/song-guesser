import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import spotifyLogo from './assets/spotify.png'

import {useSpotifyStore} from './spotify/auth'
import Callback from './Callback'
import { getAllTracksByArtist } from './spotify/fetchers'
import {useSpotifyPlayerStore} from './spotify/SpotifyPlayer'
import AlbumPicker from './spotify/AlbumPicker'
import useGameData, { getStageDuration } from './game/game'
import { use } from 'react'
import GuessPicker from './spotify/GuessPicker'
import Picker from './spotify/Picker'
import Confetti from 'react-confetti-boom'



function Home() {
  const authenticate = useSpotifyStore((state) => state.authenticate)
  const logout = useSpotifyStore((state) => state.logout)
  const getProfile = useSpotifyStore((state) => state.getProfile)
  const accessToken = useSpotifyStore((state) => state.accessToken)
  const [profile, setProfile] = useState(null)
  const [artists, setArtists] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)

  const websocketOpen = useSpotifyPlayerStore((state) => state.websocketOpen)
  const connected = useSpotifyPlayerStore((state) => state.connected)
  const initializePlayer = useSpotifyPlayerStore((state) => state.initializePlayer)
  const currentTrack = useSpotifyPlayerStore((state) => state.currentTrack)
  const playTrack = useSpotifyPlayerStore((state) => state.playTrack)
  const playSong = useSpotifyPlayerStore((state) => state.playSong)
  const changePosition = useSpotifyPlayerStore((state) => state.changePosition)
  const isPlaying = useSpotifyPlayerStore((state) => state.isPlaying)
  const addListener = useSpotifyPlayerStore((state) => state.onPlayerEvent)
  const removeListener = useSpotifyPlayerStore((state) => state.removeListener)
  const transferPlayback = useSpotifyPlayerStore((state) => state.transferPlayback)

  const gameActive = useGameData((state) => state.gameActive)
  const gameStage = useGameData((state) => state.stage)
  const gameSong = useGameData((state) => state.song)
  const gameSongIndex = useGameData((state) => state.startIndex)

  const playing = useGameData((state) => state.playing)
  const setPlaying = useGameData((state) => state.setPlaying)
  const setNotPlaying = useGameData((state) => state.setNotPlaying)
  const endTime = useGameData((state) => state.endTime)

  const replay = useGameData((state) => state.replay)

  useEffect(() => {

    let isMounted = true;

    if (accessToken) {
      getProfile().then(data => {
        if(data.error){
          logout()
        }

        if (isMounted) {
          console.log(data)
          setProfile(data)

          if(!connected && !websocketOpen){
            initializePlayer(accessToken["access_token"])
          }
        }
      })
    }

    return () => {
      isMounted = false;
    }
  }, [accessToken, getProfile])

  useEffect(() => {
    if (profile) {
      setShowPlayer(true);
    }
    return () => setShowPlayer(false);
  }, [profile]);

  useEffect(() => {
    setNotPlaying()
  }, [])

  const playSnippet = async () => {
    const uri = `spotify:track:${gameSong.id}`;
    const duration = getStageDuration(gameStage);
    const startPosition = gameSongIndex;
    console.log(`(1) Playing snippet of ${gameSong.name} for ${duration}ms from ${startPosition}ms`);

    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    await transferPlayback();
    await playSong(uri, startPosition);
    await playTrack()
    setPlaying()

    let paused = false;

    let posChanged = false;

    

    const onPlayerStateChanged = (state) => {
      if (!state) {
        console.log('No state available');
        return;
      }
      
      // Only try to seek if we're actively playing and position is wrong
      if (!posChanged && 
          state.loading === false && 
          state.position !== startPosition && 
          state.context.uri !== "-") {
        changePosition(startPosition);
        posChanged = true;
        console.log("Correcting position to:", startPosition);
      }
    

      if (state.position != 0 && state.loading == false) {
        if (!paused) {
          console.log("STARTED!")
          setTimeout(async () => {
            await playTrack(); // Pause the track
            setNotPlaying()
          }, duration + 1000);
          paused = true;
        }
      }
      console.log('Player state changed:', state);
    };
    addListener('player_state_changed', onPlayerStateChanged)
    
    
  };

  const [tlString, setTlString] = useState(null)

  const status = useGameData((state) => state.status)

  const clear = useGameData((state) => state.clear)

  return (
    <div className='bg-zinc-950'>
      <div className='p-4 min-h-screen flex flex-col text-white'>

        <h1 className='font-unbounded text-white text-center text-xl font-bold'>tuneguessr</h1>
        {accessToken ? (
          <>
            <div className='flex flex-col flex-1'>
              <div className='flex-1 flex flex-col'>
                {gameActive ? (
                  <div>
                    {status==null &&
                      <div>
                      <div className='relative items-center justify-center flex flex-col mt-4'>
                        {/* <div>Game is active, stage: {gameStage} {isPlaying?"Playing":"Not Playing"}</div> */}
                        {playing && 
                        <div className='relative flex flex-col items-center bg-spotify-green rounded-full'>
                          <button>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="6" y="5" width="4" height="14" fill="#000000"/>
                              <rect x="14" y="5" width="4" height="14" fill="#000000"/>
                            </svg>
                          </button>
                        </div>
                        
                        }
                        {!playing &&
                        <div className='relative flex flex-col items-center bg-spotify-green rounded-full'>
                          <button onClick={() => playSnippet()} className='relative'>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5v14l11-7L8 5z" fill="#000000"/>
                            </svg>
                          </button>
                        </div>
                        }

                        <div className=" absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-[0.3] rounded-full">
                          {getStageDuration(gameStage)/1000}s
                        </div>

                      </div>
                      <GuessPicker />
                    </div>
                    }
                    {status=="lost" &&
                      <div className='items-center justify-center flex flex-col mt-4'>
                        <img src={gameSong.image} className='w-[30%] h-[30%]' />
                        <h2 className='font-unbounded text-white text-lg mt-2'>{gameSong.name}</h2>
                        <h2 className='font-unbounded text-white text-sm'>{gameSong.artists}</h2>
                        <div className='flex flex-row space-x-2'>
                          <button className='bg-spotify-green py-2 px-4 rounded-lg text-black mt-2 font-unbounded' onClick={() => {
                            replay()
                          }}>Play Again</button>
                          <button className='bg-zinc-800 py-2 px-4 rounded-lg text-white mt-2 font-unbounded' onClick={() => {
                            clear()
                          }}>New Game</button>
                        </div>
                      </div>
                    }
                    {status=="won" &&
                      <div className='items-center justify-center flex flex-col mt-4'>
                        <Confetti 
                          particleCount={500}
                          shapeSize={24}
                          deg={270}
                          effectInterval={1000000}
                          spreadDeg={75}
                          launchSpeed={3}
                          colors={["#fafafa", "#1ED760"]}
                        />
                        <img src={gameSong.image} className='w-[30%] h-[30%]' />
                        <h2 className='font-unbounded text-white text-lg mt-2'>{gameSong.name}</h2>
                        <h2 className='font-unbounded text-white text-sm'>{gameSong.artists}</h2>
                        <div className='flex flex-row space-x-2'>
                          <button className='bg-spotify-green py-2 px-4 rounded-lg text-black mt-2 font-unbounded' onClick={() => {
                            replay()
                          }}>Play Again</button>
                          <button className='bg-zinc-800 py-2 px-4 rounded-lg text-white mt-2 font-unbounded' onClick={() => {
                            clear()
                          }}>New Game</button>
                        </div>

                      </div>
                    }
                  </div>
                ) : (
                  <Picker />
                )}
              </div>

              {profile && (
                <div className='mt-auto'>
                  <div className='items-center justify-center flex flex-col py-4'>
                    <h2>signed in as {profile.display_name} (<button onClick={logout}><u>logout</u></button>)</h2>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className='self-end items-center justify-center text-center flex flex-col mt-8'>
            <h2 className='w-[80%]'>tuneguesser is a game which allows you to test how well you know your favourite artists. pick an album, a playlist or an artist and see if you have what it takes to guess what song was played from a 5 second clip.</h2>
            <button onClick={authenticate} className="mt-8 flex flex-row bg-spotify-green rounded-md text-spotify-black px-4 py-2 space-x-2 items-center ">
              <img src={spotifyLogo} alt="Spotify Logo" width="20" />
              <span>Login with Spotify</span>
              </button>
          </div>
          
        )}
      </div>
    </div>
  )
}
export default Home