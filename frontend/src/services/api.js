import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default {
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  getMe() {
    return apiClient.get('/auth/user/me');
  },
  getCompetitions() {
    return apiClient.get('/competition/all');
  },
  createTournament(tournamentData) {
    return apiClient.post('/tournament', tournamentData);
  },
  getTournaments() {
    return apiClient.get('/tournament/all');
  },
  // Agrega otras llamadas a la API aquí
};
