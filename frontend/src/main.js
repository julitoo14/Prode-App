import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from "./routes";
import { useAuth } from './store/auth';
import api from './services/api';

const app = createApp(App);

app.use(router);

const { setAuthenticated, setUser } = useAuth();

const token = localStorage.getItem('token');

if (token) {
  api.getMe().then(response => {
    setAuthenticated(true);
    setUser(response.data.user);
    app.mount('#app');
  }).catch(() => {
    localStorage.removeItem('token');
    app.mount('#app');
  });
} else {
  app.mount('#app');
}
