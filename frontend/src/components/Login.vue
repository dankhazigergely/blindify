<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto">
    <!-- Logo/Title -->
    <div class="flex flex-col items-center mb-8">
      <img src="/blindify-logo.png" alt="Blindify Logo" class="w-32 h-32 mb-4">
      <h1 class="text-4xl font-bold text-center text-white">Blindify</h1>
    </div>
    
    <!-- Description -->
    <p class="text-center text-gray-300 mb-10">
      Hallgasd a Spotify lejátszási listáidat új módon - vakon! <br>
      Fedezd fel újra a zenéidet.
    </p>
    
    <!-- Login Button -->
    <button 
      @click="login" 
      class="bg-teal-700 hover:bg-teal-600 text-white text-xl flex items-center justify-center w-full max-w-xs py-3 px-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      Bejelentkezés Spotify-val
    </button>
    
    <!-- Premium requirement notice -->
    <p class="text-gray-400 text-sm mt-8 text-center">
      Megjegyzés: A lejátszás funkcióhoz Spotify Premium előfizetés szükséges.
    </p>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="mt-6 flex flex-col items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      <p class="mt-2 text-gray-400">Kapcsolódás a Spotify-hoz...</p>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="mt-6 p-4 bg-red-900/50 text-red-300 rounded-lg max-w-xs text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

// Handle login button click
const login = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Get the login URL from the backend
    const response = await fetch('/api/auth/login-url');
    const data = await response.json();
    
    // Redirect to Spotify login
    window.location.href = data.login_url;
  } catch (err) {
    console.error('Failed to get login URL:', err);
    error.value = 'Nem sikerült kapcsolódni a hitelesítési szolgáltatáshoz. Kérjük, próbálja újra.';
    loading.value = false;
  }
};

onMounted(async () => {
  // If we're on the callback route, handle the code exchange
  if (route.path === '/callback') {
    const code = new URLSearchParams(window.location.search).get('code');
    const error_code = new URLSearchParams(window.location.search).get('error');
    
    if (error_code) {
      error.value = 'A hitelesítés sikertelen vagy megtagadásra került. Kérjük, próbálja újra.';
      loading.value = false;
      return;
    }
    
    if (code) {
      loading.value = true;
      try {
        await authStore.exchangeToken(code);
        router.push('/playlists');
      } catch (err) {
        console.error('Token exchange failed:', err);
        error.value = 'Nem sikerült befejezni a hitelesítést. Kérjük, próbálja újra.';
        loading.value = false;
      }
    }
  }
  
  // If already authenticated, redirect to playlists
  if (authStore.isAuthenticated) {
    router.push('/playlists');
  }
});
</script>
