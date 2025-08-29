require('express-async-errors')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const competitionRoutes = require('./routes/competition.routes');
const participanteRoutes = require('./routes/participante.routes');
const partidoRoutes = require('./routes/partido.routes');
const predictionRoutes = require('./routes/prediction.routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', userRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/participante', participanteRoutes);
app.use('/api/partido', partidoRoutes);
app.use('/api/prediction', predictionRoutes);
app.get('/health', (req, res) => res.json({ ok: true }));
// app.use(express.static(path.join(__dirname, '/dist')));
app.use(errorHandler);


module.exports = app;
