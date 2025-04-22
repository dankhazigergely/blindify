import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Initialize Pinia for state management
const pinia = createPinia();

// Create and mount the app
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
