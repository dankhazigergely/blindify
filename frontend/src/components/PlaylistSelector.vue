<template>
  <div class="w-full max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center">Válassz egy lejátszási listát</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      <p class="mt-4 text-gray-400">Lejátszási listák betöltése...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="p-6 bg-red-900/50 text-red-300 rounded-lg text-center">
      <p>{{ error }}</p>
      <button @click="fetchPlaylists" class="mt-4 btn-secondary">Próbáld újra</button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="playlists.length === 0" class="p-6 bg-gray-800 rounded-lg text-center">
      <p class="text-gray-300">Még nincsenek lejátszási listáid.</p>
      <a 
        href="https://open.spotify.com/collection/playlists" 
        target="_blank" 
        class="mt-4 inline-block btn-secondary"
      >
        Lejátszási lista létrehozása a Spotify-on
      </a>
    </div>
    
    <!-- Playlist list -->
    <div v-else class="grid gap-3 md:grid-cols-2 w-full max-w-full">
      <button
        v-for="playlist in playlists"
        :key="playlist.id"
        @click="selectPlaylist(playlist)"
        class="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition duration-200 flex items-center text-left w-full max-w-full overflow-hidden"
        style="min-width:0;"
      >
        <!-- Playlist cover image -->
        <div class="w-12 h-12 flex-shrink-0 mr-3 bg-gray-700 rounded overflow-hidden">
          <img 
            v-if="playlist.images && playlist.images.length > 0" 
            :src="playlist.images[0].url" 
            :alt="`${playlist.name} borítója`"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        </div>
        
        <!-- Playlist info -->
        <div class="overflow-hidden min-w-0 w-full">
          <h3 class="font-medium text-white truncate max-w-full">{{ playlist.name }}</h3>
          <p class="text-gray-400 text-sm truncate max-w-full">
            {{ playlist.tracks.total }} szám
          </p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

const router = useRouter();
const authStore = useAuthStore();
const playerStore = usePlayerStore();

const playlists = ref([]);
const loading = ref(true);
const error = ref('');

// Fetch playlists from Spotify API
const fetchPlaylists = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    if (!authStore.isAuthenticated) {
      throw new Error('Nincs hitelesítve');
    }
    
    const response = await fetch(`/api/spotify/playlists?access_token=${authStore.accessToken}`);
    
    if (!response.ok) {
      throw new Error('Nem sikerült betölteni a lejátszási listákat');
    }
    
    const data = await response.json();
    playlists.value = data.items.filter(playlist => playlist.tracks.total > 0);
    
  } catch (err) {
    console.error('Error fetching playlists:', err);
    error.value = 'Nem sikerült betölteni a lejátszási listákat. Kérjük, próbálja újra.';
    
    // Handle token expiration
    if (err.message.includes('token')) {
      try {
        await authStore.refreshToken();
        await fetchPlaylists();
      } catch (refreshErr) {
        authStore.clearAuth();
        router.push('/');
      }
    }
  } finally {
    loading.value = false;
  }
};

// Select a playlist and navigate to play screen
const selectPlaylist = async (playlist) => {
  try {
    loading.value = true;
    
    // Fetch the playlist tracks
    const response = await fetch(
      `/api/spotify/playlist/${playlist.id}/tracks?access_token=${authStore.accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Nem sikerült betölteni a lejátszási lista számait');
    }
    
    const data = await response.json();
    
    if (data.items.length === 0) {
      error.value = 'Ennek a lejátszási listának nincsenek lejátszható számai.';
      loading.value = false;
      return;
    }
    
    // Store the playlist and its tracks in the player store
    playerStore.setPlaylist({
      id: playlist.id,
      name: playlist.name,
      tracks: data.items,
      currentIndex: -1, // No track selected yet
      playedTracks: []  // No tracks played yet
    });
    
    // Select a random track
    playerStore.selectRandomTrack();
    
    // Navigate to play button screen
    router.push('/play');
    
  } catch (err) {
    console.error('Error selecting playlist:', err);
    error.value = 'Nem sikerült betölteni a lejátszási lista számait. Kérjük, próbálja újra.';
    loading.value = false;
  }
};

onMounted(() => {
  fetchPlaylists();
});
</script>
