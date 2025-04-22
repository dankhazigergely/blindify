<template>
  <div class="flex flex-col items-center justify-center w-full max-w-md mx-auto">
    <!-- Playlist name -->
    <h2 class="text-xl font-medium text-gray-300 mb-8">
      {{ playerStore.currentPlaylist?.name }}
    </h2>
    
    <!-- Playing indicator -->
    <div class="flex items-center mb-12">
      <div class="relative w-8 h-8 mr-3">
        <!-- Animated waveform for playing state -->
        <div v-if="playerStore.isPlaying" class="flex items-end h-full space-x-1">
          <div class="w-1 bg-green-500 h-3 animate-pulse-slow"></div>
          <div class="w-1 bg-green-500 h-5 animate-pulse-fast"></div>
          <div class="w-1 bg-green-500 h-4 animate-pulse-medium"></div>
          <div class="w-1 bg-green-500 h-6 animate-pulse-slow"></div>
        </div>
        
        <!-- Pause icon for paused state -->
        <div v-else class="flex items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <p class="text-gray-300">
        {{ playerStore.isPlaying ? 'Most játszik' : 'Szüneteltetve' }}
      </p>
    </div>
    
    <!-- Control Buttons -->
    <div class="flex flex-col items-center space-y-10 w-full">
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
      
      <!-- Reveal Button -->
      <button 
        @click="revealTrack" 
        class="w-60 h-32 text-3xl flex items-center justify-center rounded-2xl shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-blue-100 border border-blue-700 font-bold gap-4"
      >
        <!-- Szemüveg ikon (klasszikus glasses SVG) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 64 64" fill="none">
          <ellipse cx="18" cy="40" rx="10" ry="8" stroke="currentColor" stroke-width="3" fill="none" />
          <ellipse cx="46" cy="40" rx="10" ry="8" stroke="currentColor" stroke-width="3" fill="none" />
          <rect x="28" y="38.5" width="8" height="3" fill="currentColor" stroke="none" />
          <path d="M8 40c-2-13 10-13 10-13" stroke="currentColor" stroke-width="3" fill="none" />
          <path d="M56 40c2-13-10-13-10-13" stroke="currentColor" stroke-width="3" fill="none" />
        </svg>
        <span>Felfedés</span>
      </button>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="mt-8 p-4 bg-red-900/50 text-red-300 rounded-lg max-w-xs text-center">
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

// Navigate to the reveal screen
const revealTrack = () => {
  router.push('/reveal');
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

<style scoped>
/* Animation keyframes for the playing indicator */
@keyframes pulse-slow {
  0%, 100% { height: 30%; }
  50% { height: 70%; }
}

@keyframes pulse-medium {
  0%, 100% { height: 40%; }
  50% { height: 80%; }
}

@keyframes pulse-fast {
  0%, 100% { height: 50%; }
  50% { height: 90%; }
}

.animate-pulse-slow {
  animation: pulse-slow 1.8s infinite;
}

.animate-pulse-medium {
  animation: pulse-medium 1.2s infinite;
}

.animate-pulse-fast {
  animation: pulse-fast 0.9s infinite;
}
</style>
