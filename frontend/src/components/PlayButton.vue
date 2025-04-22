<template>
  <div class="flex flex-col items-center justify-center w-full max-w-md mx-auto h-[60vh]">
    <!-- Playlist name -->
    <h2 class="text-xl font-medium text-gray-300 mb-8">
      {{ playerStore.currentPlaylist?.name }}
    </h2>
    
    <!-- Big Play Button -->
    <button 
      @click="playTrack" 
      class="w-60 h-60 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white
        shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="mt-8 flex flex-col items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      <p class="mt-2 text-gray-400">Előkészítés a lejátszáshoz...</p>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 text-red-300 rounded-lg max-w-xs text-center">
      <p>{{ error }}</p>
      <button @click="playerStore.selectRandomTrack()" class="mt-4 btn-secondary text-sm">
        Próbálj egy másik számot
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const playerStore = usePlayerStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

// Start playing the selected track
const playTrack = async () => {
  if (!playerStore.currentTrack) {
    error.value = 'Nincs kiválasztott szám. Kérjük, előbb válasszon egy lejátszási listát.';
    router.push('/playlists');
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    if (!playerStore.isInitialized) {
      await playerStore.initializePlayer(authStore.accessToken);
    }
    
    // Start playback of the current track
    const success = await playerStore.startPlayback();
    
    if (success) {
      // Navigate to player controls screen
      router.push('/player');
    } else {
      throw new Error('Nem sikerült elindítani a lejátszást');
    }
  } catch (err) {
    console.error('Playback error:', err);
    
    if (err.message.includes('Premium')) {
      error.value = 'A lejátszáshoz Spotify Premium előfizetés szükséges. Kérjük, frissítse fiókját.';
    } else {
      error.value = 'Nem sikerült elindítani a lejátszást. Kérjük, próbálja újra.';
    }
    
    loading.value = false;
  }
};
</script>
