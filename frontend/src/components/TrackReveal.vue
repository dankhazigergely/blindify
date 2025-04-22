<template>
  <div class="flex flex-col items-center justify-center w-full max-w-md mx-auto">
    <!-- Playlist name -->
    <h2 class="text-xl font-medium text-gray-300 mb-6">
      {{ playerStore.currentPlaylist?.name }}
    </h2>
    
    <!-- Album Artwork -->
    <div class="w-56 h-56 rounded-lg overflow-hidden shadow-lg mb-6">
      <img 
        v-if="playerStore.currentTrack?.album?.images?.length" 
        :src="playerStore.currentTrack.album.images[0].url" 
        :alt="playerStore.currentTrack.album.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
    </div>
    
    <!-- Track Information -->
    <div class="w-full p-5 bg-gray-800 rounded-lg mb-6">
      <div class="mb-3">
        <p class="text-gray-400 text-sm mb-1">Előadó</p>
        <p class="text-white font-medium">{{ getArtists() }}</p>
      </div>
      
      <div class="mb-3">
        <p class="text-gray-400 text-sm mb-1">Cím</p>
        <p class="text-white font-medium">{{ playerStore.currentTrack?.name }}</p>
      </div>
      
      <div>
        <p class="text-gray-400 text-sm mb-1">Év</p>
        <p class="text-white font-medium">{{ getReleaseYear() }}</p>
      </div>
    </div>
    
    <!-- Control Buttons -->
    <div class="flex flex-col items-center space-y-7 w-full">
      <!-- Play/Pause Button -->
      <button 
        @click="togglePlayback" 
        class="w-48 h-16 text-2xl flex items-center justify-center rounded-xl shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-800 hover:bg-gray-900 active:bg-gray-950 text-green-300 border border-green-500 font-bold gap-3"
      >
        <svg v-if="playerStore.isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ playerStore.isPlaying ? 'Szünet' : 'Lejátszás' }}</span>
      </button>
      
      <!-- New Track Button (Reveal) -->
      <button 
        @click="selectNewTrack" 
        class="w-64 h-32 text-3xl flex items-center justify-center rounded-2xl shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-blue-100 border border-blue-700 font-bold gap-4"
      >
        <!-- Nyilas ikon (új számhoz, nagy méretben) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Új szám</span>
      </button>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="mt-6 p-4 bg-red-900/50 text-red-300 rounded-lg max-w-xs text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore';

const router = useRouter();
const playerStore = usePlayerStore();
const error = ref('');

// Format artists list
const getArtists = () => {
  if (!playerStore.currentTrack || !playerStore.currentTrack.artists) {
    return 'Ismeretlen előadó';
  }
  return playerStore.currentTrack.artists.join(', ');
};

// Get release year from the release date
const getReleaseYear = () => {
  if (!playerStore.currentTrack || !playerStore.currentTrack.album || !playerStore.currentTrack.album.release_date) {
    return 'Ismeretlen év';
  }
  
  // The release date can be in format YYYY, YYYY-MM, or YYYY-MM-DD
  return playerStore.currentTrack.album.release_date.split('-')[0];
};

// Toggle between play and pause
const togglePlayback = async () => {
  error.value = '';
  try {
    if (playerStore.isPlaying) {
      await playerStore.pausePlayback();
    } else {
      await playerStore.resumePlayback();
    }
  } catch (err) {
    console.error('Playback control error:', err);
    error.value = 'Nem sikerült irányítani a lejátszást. Kérjük, próbálja újra.';
  }
};

// Select a new random track
const selectNewTrack = async () => {
  error.value = '';
  try {
    // Stop current playback
    await playerStore.stopPlayback();
    
    // Select a new random track
    playerStore.selectRandomTrack();
    
    // Navigate back to play button screen
    router.push('/play');
  } catch (err) {
    console.error('Error selecting new track:', err);
    error.value = 'Nem sikerült kiválasztani egy új számot. Kérjük, próbálja újra.';
  }
};
</script>
