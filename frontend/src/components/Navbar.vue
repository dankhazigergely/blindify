<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo/Title -->
      <router-link to="/playlists" class="flex items-center">
        <img src="/blindify-logo.png" alt="Blindify Logo" class="w-10 h-10 mr-2">
        <span class="text-xl font-bold text-white">Blindify</span>
      </router-link>
      
      <!-- Hamburger Menu -->
      <div class="relative flex items-center gap-4">
        <!-- Szünet gomb a globális sávban -->
        <button
          v-if="playerStore.isPlaying"
          @click="playerStore.pausePlayback()"
          class="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-900 text-green-300 border border-green-500 rounded-xl shadow-md transition-all duration-150 font-medium gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          title="Zene szüneteltetése"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Szünet
        </button>
        <button 
          @click="isMenuOpen = !isMenuOpen" 
          class="p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <div 
          v-if="isMenuOpen" 
          ref="dropdownMenu"
          class="fixed inset-0 z-50 flex items-start justify-end sm:justify-end"
        >
          <!-- Overlay to close menu -->
          <div class="absolute inset-0 bg-black/30" @click="isMenuOpen = false"></div>
          <div 
            class="relative mt-20 sm:mt-2 w-56 bg-gray-800 rounded-xl shadow-xl py-3 border border-gray-700 mr-4 sm:mr-0"
            style="max-width:calc(100vw-16px);"
          >
            <router-link 
              to="/playlists" 
              class="block px-6 py-3 text-base text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
              @click="isMenuOpen = false"
            >
              Lejátszási listák
            </router-link>
            <router-link 
              to="/reveal" 
              class="block px-6 py-3 text-base rounded-md transition-colors"
              :class="playerStore.currentTrack ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-500 pointer-events-none opacity-50 cursor-not-allowed'"
              @click="isMenuOpen = false"
            >
              Felfedés
            </router-link>
            <button 
              @click="logout" 
              class="block w-full text-left px-6 py-3 text-base text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

const router = useRouter();
const authStore = useAuthStore();
const playerStore = usePlayerStore();
const isMenuOpen = ref(false);

// Handle logout
const logout = async () => {
  // Stop playback if active
  if (playerStore.isInitialized) {
    await playerStore.stopPlayback();
  }
  
  // Clear player state
  playerStore.resetState();
  
  // Logout from the auth store
  await authStore.logout();
  
  // Close the menu
  isMenuOpen.value = false;
  
  // Redirect to login
  router.push('/');
};
</script>
