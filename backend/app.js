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
const errorHandler = require('./middlewares/errorHandler');
const allowedOrigins = ['http://localhost:4000', 'https://habits.juliangarciasuarez.tech'];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(bodyParser.json());
app.use('/auth', userRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/competition', competitionRoutes);
app.use('/participante', participanteRoutes);
app.use(express.static(path.join(__dirname, '/dist')));
app.use(errorHandler);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});
module.exports = app;
