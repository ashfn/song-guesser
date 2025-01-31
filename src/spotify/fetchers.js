import {useSpotifyStore} from './auth'

export const searchArtists = async (query) => {
    const { accessToken, getProfile } = useSpotifyStore.getState()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch artists')
    }

    const data = await response.json()
    console.log(data)
    return data.artists.items
}

export const searchAlbums = async (query) => {
    const { accessToken } = useSpotifyStore.getState()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch albums')
    }

    const data = await response.json()
    console.log(data)
    return data.albums.items
}

export const searchPlaylists = async (query) => {
    const { accessToken } = useSpotifyStore.getState()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch playlists')
    }

    const data = await response.json()
    console.log(data)
    return data.playlists.items
}

export const getAllTracksByArtist = async (artistName, artistId) => {
    const { accessToken } = useSpotifyStore.getState()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    let allTracks = []
    const searchQuery = `artist:"${artistName}"`
    let nextUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50`

    while (nextUrl) {
        const response = await fetch(nextUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch tracks')
        }

        const data = await response.json()
        const tracks = data.tracks.items

        for (const track of tracks) {
            if (track.artists.some(artist => artist.id === artistId)) {
                allTracks.push(track)
            } else {
                return allTracks
            }
        }

        nextUrl = data.tracks.next
    }

    return allTracks
}

export const getAllTracksInPlaylist = async (playlistId) => {
    const { accessToken } = useSpotifyStore.getState()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    let allTracks = []
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`

    while (nextUrl) {
        const response = await fetch(nextUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch playlist tracks')
        }

        const data = await response.json()
        console.log(data)
        allTracks = allTracks.concat(data.items.map(item => item.track))
        nextUrl = data.next
    }

    return allTracks
}