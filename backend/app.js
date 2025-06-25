const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');


const userRoutes = require('./routes/user.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const allowedOrigins = ['http://localhost:3000', 'https://habits.juliangarciasuarez.tech'];
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
app.use(express.static(path.join(__dirname, '/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});
module.exports = app;
