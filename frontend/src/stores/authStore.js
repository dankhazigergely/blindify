import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref(null);
  const expiresAt = ref(null);
  const userId = ref(null);
  
  // Computed
  const isAuthenticated = computed(() => {
    return !!accessToken.value && Date.now() < expiresAt.value;
  });
  
  // Initialize from session storage
  function initializeFromStorage() {
    const storedToken = sessionStorage.getItem('spotifyAccessToken');
    const storedExpiry = sessionStorage.getItem('spotifyTokenExpiry');
    const storedUserId = sessionStorage.getItem('spotifyUserId');
    
    if (storedToken && storedExpiry && parseInt(storedExpiry) > Date.now()) {
      accessToken.value = storedToken;
      expiresAt.value = parseInt(storedExpiry);
      userId.value = storedUserId;
    }
  }
  
  // Save to session storage
  function saveToStorage() {
    if (accessToken.value && expiresAt.value) {
      sessionStorage.setItem('spotifyAccessToken', accessToken.value);
      sessionStorage.setItem('spotifyTokenExpiry', expiresAt.value.toString());
      if (userId.value) {
        sessionStorage.setItem('spotifyUserId', userId.value);
      }
    }
  }
  
  // Clear from storage
  function clearStorage() {
    sessionStorage.removeItem('spotifyAccessToken');
    sessionStorage.removeItem('spotifyTokenExpiry');
    sessionStorage.removeItem('spotifyUserId');
  }
  
  // Exchange authorization code for tokens
  async function exchangeToken(code) {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        throw new Error('Token exchange failed');
      }
      
      const data = await response.json();
      
      // Store the access token and expiry
      accessToken.value = data.access_token;
      expiresAt.value = Date.now() + (data.expires_in * 1000);
      userId.value = data.user_id;
      
      // Save to storage
      saveToStorage();
      
      return true;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }
  
  // Refresh access token
  async function refreshToken() {
    if (!userId.value) {
      throw new Error('No user ID available for token refresh');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId.value })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      // Update the access token and expiry
      accessToken.value = data.access_token;
      expiresAt.value = Date.now() + (data.expires_in * 1000);
      
      // Save to storage
      saveToStorage();
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }
  
  // Logout - clear tokens
  async function logout() {
    if (userId.value) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId.value })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    clearAuth();
  }
  
  // Clear authentication state
  function clearAuth() {
    accessToken.value = null;
    expiresAt.value = null;
    userId.value = null;
    clearStorage();
  }
  
  return {
    accessToken,
    expiresAt,
    userId,
    isAuthenticated,
    initializeFromStorage,
    exchangeToken,
    refreshToken,
    logout,
    clearAuth
  };
});
