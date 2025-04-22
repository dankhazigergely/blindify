<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <!-- Navbar (always visible) -->
    <Navbar v-if="authStore.isAuthenticated" />
    
    <!-- Main content -->
    <main class="flex-grow container mx-auto px-4 py-6 flex flex-col items-center justify-center">
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer class="p-4 text-center text-gray-500 text-sm">
      <p>Blindify - Véletlen Spotify Lejátszó</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { usePlayerStore } from './stores/playerStore';
import Navbar from './components/Navbar.vue';

const router = useRouter();
const authStore = useAuthStore();
const playerStore = usePlayerStore();

onMounted(() => {
  // Check for existing token in session storage
  authStore.initializeFromStorage();
  
  // Initialize Spotify player when SDK is ready
  document.addEventListener('spotify-player-ready', () => {
    if (authStore.isAuthenticated) {
      playerStore.initializePlayer(authStore.accessToken);
    }
  });
  
  // If SDK is already ready, initialize player
  if (window.SpotifyPlayerReady && authStore.isAuthenticated) {
    playerStore.initializePlayer(authStore.accessToken);
  }
});
</script>

<style>
/* Global styles */
body {
  @apply bg-gray-900 text-white;
  font-family: 'Inter', sans-serif;
}

/* Transitions for page changes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom button styles */
.btn-primary {
  @apply bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full 
  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full 
  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50;
}
</style>
