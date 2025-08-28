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
  createParticipante(participanteData) {
    return apiClient.post('/participante', participanteData);
  },
  getTournaments() {
    return apiClient.get('/tournament/all');
  },
  getParticipaciones() {
    return apiClient.get('/participante/byUser');
  },
  getParticipantesPorTorneo(tournamentId) {
    return apiClient.get(`/participante/all?tournament=${tournamentId}`);
  },
  getTournamentById(tournamentId) {
    return apiClient.get(`/tournament/${tournamentId}`);
  },
  deleteTournament(tournamentId) {
    return apiClient.delete(`/tournament/${tournamentId}`);
  },
  getPartidosByCompetitionId(competitionId, round = 4) {
    return apiClient.get(`/partido/all?competition=${competitionId}&limit=1000&half=2&round=${round}`);
  },
  // Predicciones
  savePrediction(predictionData) {
    return apiClient.post('/prediction', predictionData);
  },
  savePredictionsBatch(predictions) {
    return apiClient.post('/prediction/batch', { predictions });
  },
  getPredictionsByParticipante(participanteId) {
    return apiClient.get(`/prediction/byParticipante/${participanteId}`);
  },
  getPredictionsByPartido(partidoId) {
    return apiClient.get(`/prediction/byPartido/${partidoId}`);
  },
  updatePrediction(predictionId, predictionData) {
    return apiClient.put(`/prediction/${predictionId}`, predictionData);
  },
  // Agrega otras llamadas a la API aquí
};
