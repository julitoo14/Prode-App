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
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(bodyParser.json());
app.use('/auth', userRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/competition', competitionRoutes);
app.use('/participante', participanteRoutes);
app.use('/partido', partidoRoutes);
app.use(express.static(path.join(__dirname, '/dist')));
app.use(errorHandler);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

module.exports = app;
