import {create} from 'zustand';

export const useSpotifyPlayerStore = create((set, get) => ({
  // State properties
  player: null,
  deviceId: null,
  accessToken: null,
  currentTrack: null,
  isPlaying: false,

  // Initialize the Spotify SDK
  initializePlayer: (token) => {
    set({ accessToken: token });

    if (!window.Spotify) {
      console.error('Spotify SDK not loaded');
      return;
    }

    const player = new window.Spotify.Player({
      name: 'Song Guessing Game',
      getOAuthToken: (cb) => cb(token),
      volume: 0.5,
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => console.error(message));
    player.addListener('authentication_error', ({ message }) => console.error(message));
    player.addListener('account_error', ({ message }) => console.error(message));
    player.addListener('playback_error', ({ message }) => console.error(message));

    // Ready event
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID:', device_id);
      set({ deviceId: device_id });
      //get().transferPlayback();

    });

    // Not Ready event
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Player state changed event
    player.addListener('player_state_changed', (state) => {
      if (state) {
        const currentTrack = state.track_window.current_track;
        set({
          currentTrack: currentTrack,
          isPlaying: !state.paused,
        });
      }
    });

    player.connect().then((success) => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
        set({ player });
        // transfer playback
      }
    });
  },

  // Play a song
  playSong: async (uri, position=0) => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) {
      console.error('Player not initialized or access token missing');
      return;
    }

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri], position_ms:position }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error playing song:', error);
    }
  },

  // Pause playback
  pausePlayback: async () => {
    const { accessToken } = get();
    if (!accessToken) {
      console.error('Access token missing');
      return;
    }

    try {
      await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  },

  // Get currently playing track
  getCurrentlyPlaying: async () => {
    const { accessToken } = get();
    if (!accessToken) {
      console.error('Access token missing');
      return;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204) {
        console.log('No track currently playing');
        return;
      }

      const data = await response.json();
      set({ currentTrack: data.item });
    } catch (error) {
      console.error('Error getting currently playing track:', error);
    }
  },

  // Listen to events
  onPlayerEvent: (eventName, callback) => {
    const { player } = get();
    if (!player) {
      console.error('Player not initialized');
      return;
    }

    player.addListener(eventName, callback);
  },
  isPlayerConnected: () => {
    const { player } = get();
    if (!player) {
      console.error('Player not initialized');
      return false;
    }

    return player._options && player._options.id;
  },

  // Check if the WebSocket connection is open
  isWebSocketOpen: () => {
    const { player } = get();
    if (!player || !player._webSocket) {
      console.error('Player or WebSocket not initialized');
      return false;
    }

    return player._webSocket.readyState === WebSocket.OPEN;
  },
  playTrack: () => {
    const { player } = get();
    if (!player) {
      console.error('Player not initialized');
      return;
    }

    player.togglePlay();
  },
  changePosition: (amt) => {
    const { player } = get();
    if (!player) {
      console.error('Player not initialized');
      return;
    }

    player.seek(amt);
  },
  transferPlayback: async () => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) {
      console.error('Player not initialized or access token missing');
      return;
    }

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  },
  // remove listener
  removeListener: (eventName, callback) => {
    const { player } = get();
    if (!player) {
      console.error('Player not initialized');
      return;
    }

    player.removeListener(eventName, callback);
  },
}));
