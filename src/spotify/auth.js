import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const generateCodeVerifier = () => {
    const array = new Uint8Array(56)
    window.crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
  }

  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

export const ConnectionState = {
  "CONNECTED": "CONNECTED",
  "DISCONNECTED": "DISCONNECTED",
  "CONNECTING": "CONNECTING",
}

export const useSpotifyStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      codeVerifier: null,
      connectDeviceId: null,
      connectionState: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setCodeVerifier: (verifier) => set({ codeVerifier: verifier }),
      setConnectDeviceId: (deviceId) => set({ connectDeviceId: deviceId }),
      authenticate: async () => {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        get().setCodeVerifier(codeVerifier)
        
        const clientId = '261da8430d2c4642b3ff75aa21e07b78'
        const redirectUri = 'https://asherfalcon.com/callback.html'
        const scope = 'user-read-private user-read-email playlist-read-private user-follow-read user-library-read user-modify-playback-state user-read-currently-playing user-read-playback-state streaming'
        const state = 'some-random-state'

        const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`
        
        window.location.href = authUrl
      },
      handleRedirect: async (code) => {
        console.log(`CODE: ${code}`)
        const codeVerifier = get().codeVerifier
        const clientId = '261da8430d2c4642b3ff75aa21e07b78'
        const redirectUri = 'https://asherfalcon.com/callback.html'

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
          }),
        })

        const data = await response.json()
        console.log(`RESPONSE: ${JSON.stringify(data)}`)
        get().setAccessToken(data)
      },
      logout: () => {
        set({ accessToken: null, connectionState: null, codeVerifier: null })
      
      },
      getProfile: async () => {
        const result = await fetch("https://api.spotify.com/v1/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${get().accessToken.access_token}` }
        })
        return await result.json()
      },
      getDevices: async () => {
        const result = await fetch("https://api.spotify.com/v1/me/player/devices", {
          method: "GET",
          headers: { Authorization: `Bearer ${get().accessToken.access_token}` }
        })
        return await result.json()
      },
      setConnecting: () => set({ connectionState: ConnectionState.CONNECTING }),
      setConnected: () => set({ connectionState: ConnectionState.CONNECTED }),
      setDisconnected: () => set({ connectionState: ConnectionState.DISCONNECTED }),
    }),
    {
      name: 'spotify-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

