import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './authStore';

export const usePlayerStore = defineStore('player', () => {
  // State
  const player = ref(null);
  const deviceId = ref(null);
  const isInitialized = ref(false);
  const isReady = ref(false);
  const isPlaying = ref(false);
  const currentPlaylist = ref(null);
  const currentTrack = ref(null);
  const error = ref(null);
  
  // Initialize the Spotify Web Playback SDK
  async function initializePlayer(token) {
    if (isInitialized.value) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Wait for the SDK to be ready if it's not yet
        if (!window.Spotify || !window.SpotifyPlayerReady) {
          document.addEventListener('spotify-player-ready', () => {
            initializePlayerInternal(token, resolve, reject);
          });
        } else {
          initializePlayerInternal(token, resolve, reject);
        }
      } catch (err) {
        console.error('Player initialization error:', err);
        error.value = 'Failed to initialize Spotify player';
        reject(err);
      }
    });
  }
  
  // Internal function to handle player initialization
  function initializePlayerInternal(token, resolve, reject) {
    try {
      player.value = new window.Spotify.Player({
        name: 'Blindify Web Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5
      });
      
      // Error handling
      player.value.addListener('initialization_error', ({ message }) => {
        console.error('Player initialization error:', message);
        error.value = 'Failed to initialize Spotify player';
        reject(new Error(message));
      });
      
      player.value.addListener('authentication_error', ({ message }) => {
        console.error('Player authentication error:', message);
        error.value = 'Authentication failed with Spotify';
        reject(new Error(message));
      });
      
      player.value.addListener('account_error', ({ message }) => {
        console.error('Player account error:', message);
        error.value = 'Spotify Premium is required for playback';
        reject(new Error('Spotify Premium is required for playback'));
      });
      
      player.value.addListener('playback_error', ({ message }) => {
        console.error('Player playback error:', message);
        error.value = 'Playback error occurred';
      });
      
      // Ready event
      player.value.addListener('ready', ({ device_id }) => {
        console.log('Player ready with device ID:', device_id);
        deviceId.value = device_id;
        isReady.value = true;
        resolve(true);
      });
      
      // Not ready event
      player.value.addListener('not_ready', ({ device_id }) => {
        console.log('Player not ready, device ID:', device_id);
        isReady.value = false;
      });
      
      // Player state changed event
      player.value.addListener('player_state_changed', state => {
        if (!state) {
          isPlaying.value = false;
          return;
        }
        
        isPlaying.value = !state.paused;
      });
      
      // Connect to Spotify
      player.value.connect();
      isInitialized.value = true;
    } catch (err) {
      console.error('Player setup error:', err);
      error.value = 'Failed to set up Spotify player';
      reject(err);
    }
  }
  
  // Set the current playlist
  function setPlaylist(playlist) {
    currentPlaylist.value = playlist;
  }
  
  // Select a random track from the playlist
  function selectRandomTrack() {
    if (!currentPlaylist.value || !currentPlaylist.value.tracks || currentPlaylist.value.tracks.length === 0) {
      error.value = 'No tracks available in the playlist';
      return null;
    }
    
    const allTracks = currentPlaylist.value.tracks;
    const playedTrackIds = currentPlaylist.value.playedTracks || [];
    
    // Get only tracks that haven't been played yet
    const unplayedTracks = allTracks.filter(track => !playedTrackIds.includes(track.id));
    
    // If all tracks have been played, reset and use all tracks
    if (unplayedTracks.length === 0) {
      currentPlaylist.value.playedTracks = [];
      currentTrack.value = allTracks[Math.floor(Math.random() * allTracks.length)];
    } else {
      // Select a random unplayed track
      currentTrack.value = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
    }
    
    // Add to played tracks
    if (!currentPlaylist.value.playedTracks) {
      currentPlaylist.value.playedTracks = [];
    }
    currentPlaylist.value.playedTracks.push(currentTrack.value.id);
    
    return currentTrack.value;
  }
  
  // Start playback of the current track
  async function startPlayback() {
    if (!isInitialized.value || !isReady.value || !deviceId.value) {
      error.value = 'Spotify player is not ready';
      return false;
    }
    
    if (!currentTrack.value) {
      error.value = 'No track selected';
      return false;
    }
    
    const authStore = useAuthStore();
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`
        },
        body: JSON.stringify({
          uris: [currentTrack.value.uri]
        })
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          error.value = 'Spotify Premium is required for playback';
          throw new Error('Spotify Premium is required for playback');
        } else {
          const data = await response.json();
          error.value = data.error?.message || 'Failed to start playback';
          throw new Error(error.value);
        }
      }
      
      isPlaying.value = true;
      return true;
    } catch (err) {
      console.error('Start playback error:', err);
      error.value = err.message || 'Failed to start playback';
      return false;
    }
  }
  
  // Pause playback
  async function pausePlayback() {
    if (!isInitialized.value || !player.value) {
      return false;
    }
    
    try {
      await player.value.pause();
      isPlaying.value = false;
      return true;
    } catch (err) {
      console.error('Pause playback error:', err);
      error.value = 'Failed to pause playback';
      return false;
    }
  }
  
  // Resume playback
  async function resumePlayback() {
    if (!isInitialized.value || !player.value) {
      return false;
    }
    
    try {
      await player.value.resume();
      isPlaying.value = true;
      return true;
    } catch (err) {
      console.error('Resume playback error:', err);
      error.value = 'Failed to resume playback';
      return false;
    }
  }
  
  // Stop playback
  async function stopPlayback() {
    if (!isInitialized.value || !player.value) {
      return false;
    }
    
    try {
      await player.value.pause();
      isPlaying.value = false;
      return true;
    } catch (err) {
      console.error('Stop playback error:', err);
      error.value = 'Failed to stop playback';
      return false;
    }
  }
  
  // Reset player state
  function resetState() {
    if (player.value) {
      try {
        player.value.disconnect();
      } catch (e) {
        console.error('Error disconnecting player:', e);
      }
    }
    
    player.value = null;
    deviceId.value = null;
    isInitialized.value = false;
    isReady.value = false;
    isPlaying.value = false;
    currentPlaylist.value = null;
    currentTrack.value = null;
    error.value = null;
  }
  
  return {
    isInitialized,
    isReady,
    isPlaying,
    currentPlaylist,
    currentTrack,
    error,
    initializePlayer,
    setPlaylist,
    selectRandomTrack,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    resetState
  };
});
