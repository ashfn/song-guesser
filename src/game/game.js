import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSpotifyStore } from '../spotify/auth';
import { useErrorStore } from './errors';
import { getAllTracksByArtist, getAllTracksInPlaylist } from '../spotify/fetchers';

// game has 4 stages (levels)
// stage 1 is 5 second
// stagr 2 is 10 seconds
// stage 3 is 15 seconds
// stage 4 is 30 seconds

export const getStageDuration = (stage) => {
    switch (stage) {
        case 1:
            return 5000;
        case 2:
            return 10000;
        case 3:
            return 15000;
        case 4:
            return 30000;
    }
}

const useGameData = create(
    persist(
        (set, get) => ({
            gameActive: false,
            song: null,
            potentialSongs: null,
            stage: null,
            startIndex: null,
            gameType: null,
            playing: false,
            endTime: null,
            status: null,
            reference: null,
            startGameWithAlbum: async (album) => {
                const accessToken = useSpotifyStore.getState().accessToken;

                if (!accessToken) {
                    console.error('Access token is missing');
                    return;
                }


                const albumId = album.id;

                try {
                    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
                        headers: {
                            Authorization: `Bearer ${accessToken["access_token"]}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch songs from album');
                    }

                    const data = await response.json();

                    const workingSongs = [];
                    data.items.forEach((item) => {
                        if(item.duration_ms >= 35000){
                            console.log(item)
                            workingSongs.push({
                                id: item.id,
                                name: item.name,
                                duration: item.duration_ms,
                                image: album.images.length > 0 ? album.images[0].url : "",
                                artists: album.artists.map(artist => artist.name).join(', '),
                                album: album.name
                            });
                        }
                    });

                    const setError = (err) => useErrorStore.setState({error: err});


                    if(workingSongs.length < 2){
                        setError('Not enough songs over 30s in album');
                        return
                    }else {
                        setError(null)
                    }

                    console.log(workingSongs)

                    const randomIndex = Math.floor(Math.random() * workingSongs.length);
                    const chosenSong = workingSongs[randomIndex];

                    const startIndex = Math.floor(Math.random() * (chosenSong.duration - 35000));

                    set({
                        potentialSongs: workingSongs,
                        song: chosenSong,   
                        gameActive: true,
                        stage: 1,
                        startIndex: startIndex,
                        gameType: 'album',
                        status: null,
                        playing: false,
                        endTime: null,
                        reference: album.id,
                    });

                    console.log('Songs fetched from album:', workingSongs);
                } catch (error) {
                    console.error('Error fetching songs from album:', error);
                }
            },
            startGameWithArtist: async (artist) => {
                const accessToken = useSpotifyStore.getState().accessToken;

                if (!accessToken) {
                    console.error('Access token is missing');
                    return;
                }


                try {
                    const tracks = await getAllTracksByArtist(artist.name, artist.id);

                    // console.log(tracks)

                    const workingSongs = [];
                    tracks.forEach((item) => {
                        if(item.duration_ms >= 35000){
                            console.log(item)
                            workingSongs.push({
                                id: item.id,
                                name: item.name,
                                duration: item.duration_ms,
                                image: item.album.images.length > 0 ? item.album.images[0].url : "",
                                artists: item.artists.map(artistName => artistName.name).join(', '),
                                album: item.album.name
                            });
                        }
                    });

                    const setError = (err) => useErrorStore.setState({error: err});

                    if(workingSongs.length < 2){
                        setError('Not enough songs over 30s by artist');
                        return
                    }else {
                        setError(null)
                    }

                    console.log(workingSongs)

                    const randomIndex = Math.floor(Math.random() * workingSongs.length);
                    const chosenSong = workingSongs[randomIndex];

                    const startIndex = Math.floor(Math.random() * (chosenSong.duration - 35000));

                    set({
                        potentialSongs: workingSongs,
                        song: chosenSong,   
                        gameActive: true,
                        stage: 1,
                        startIndex: startIndex,
                        gameType: 'artist',
                        status: null,
                        playing: false,
                        endTime: null,
                        reference: artist.id,
                    });

                    console.log('Songs fetched from album:', workingSongs);
                } catch (error) {
                    console.error('Error fetching songs from album:', error);
                }
            },
            startGameWithPlaylist: async (playlist) => {
                const accessToken = useSpotifyStore.getState().accessToken;

                if (!accessToken) {
                    console.error('Access token is missing');
                    return;
                }

                console.log(playlist)

                try {
                    const tracks = await getAllTracksInPlaylist(playlist.id);

                    const workingSongs = [];
                    tracks.forEach((item) => {
                        if(item.duration_ms >= 35000){
                            workingSongs.push({
                                id: item.id,
                                name: item.name,
                                duration: item.duration_ms,
                                image: item.album.images.length > 0 ? item.album.images[0].url : "",
                                artists: item.artists.map(artistName => artistName.name).join(', '),
                                album: item.album.name
                            });
                        }
                    });

                    const setError = (err) => useErrorStore.setState({error: err});

                    if(workingSongs.length < 2){
                        setError('Not enough songs over 30s by artist');
                        return
                    }else {
                        setError(null)
                    }

                    const randomIndex = Math.floor(Math.random() * workingSongs.length);
                    const chosenSong = workingSongs[randomIndex];

                    const startIndex = Math.floor(Math.random() * (chosenSong.duration - 35000));

                    set({
                        potentialSongs: workingSongs,
                        song: chosenSong,   
                        gameActive: true,
                        stage: 1,
                        startIndex: startIndex,
                        gameType: 'playlist',
                        status: null,
                        playing: false,
                        endTime: null,
                        reference: playlist.id,
                    });

                    console.log('Songs fetched from album:', workingSongs);
                } catch (error) {
                    console.error('Error fetching songs from album:', error);
                }
            },
            incorrectGuess: () => {
                const state = get();
                if(state.song!=null){
                    if(state.stage!=4){
                        set({
                            stage: state.stage + 1                        
                        });
                    }else{
                        get().setLost();
                        console.log("GAME LOST")
                    }
                }
            },
            setPlaying: (duration) => {
                set({
                    playing: true,
                    endTime: new Date().getTime()+duration
                })
            },
            setNotPlaying: () => {
                set({
                    playing: false,
                    endTime: null
                })
            },
            setWon: () => {
                set({
                    status: 'won'
                })
            },
            setLost: () => {
                set({
                    status: 'lost'
                })
            },
            clear: () => {
                set({
                    gameActive: false,
                    song: null,
                    potentialSongs: null,
                    stage: null,
                    startIndex: null,
                    gameType: null,
                    playing: false,
                    endTime: null,
                    status: null,
                });
            },
            replay: () => {
                const state = get();
                if (state.potentialSongs && state.potentialSongs.length > 0) {
                    const randomIndex = Math.floor(Math.random() * state.potentialSongs.length);
                    const chosenSong = state.potentialSongs[randomIndex];
                    const startIndex = Math.floor(Math.random() * (chosenSong.duration - 35000));

                    set({
                        song: chosenSong,
                        stage: 1,
                        startIndex: startIndex,
                        playing: false,
                        endTime: null,
                        status: null,
                    });
                }
            }
        }),
        {
            name: 'game-data', // unique name for localStorage key
            getStorage: () => window.localStorage,
        }
    )
);

export default useGameData;