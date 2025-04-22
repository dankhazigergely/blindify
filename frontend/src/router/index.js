import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Components
import Login from '../components/Login.vue';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import PlayButton from '../components/PlayButton.vue';
import PlayerControls from '../components/PlayerControls.vue';
import TrackReveal from '../components/TrackReveal.vue';

// Define routes
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/callback',
    name: 'Callback',
    component: Login
  },
  {
    path: '/playlists',
    name: 'PlaylistSelector',
    component: PlaylistSelector,
    meta: { requiresAuth: true }
  },
  {
    path: '/play',
    name: 'PlayButton',
    component: PlayButton,
    meta: { requiresAuth: true }
  },
  {
    path: '/player',
    name: 'PlayerControls',
    component: PlayerControls,
    meta: { requiresAuth: true }
  },
  {
    path: '/reveal',
    name: 'TrackReveal',
    component: TrackReveal,
    meta: { requiresAuth: true }
  }
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Handle the Spotify callback
  if (to.name === 'Callback') {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      authStore.exchangeToken(code);
      next('/playlists');
      return;
    }
  }
  
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next('/');
      return;
    }
  }
  
  next();
});

export default router;
