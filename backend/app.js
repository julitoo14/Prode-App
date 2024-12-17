const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
require('./database');
const cors = require('cors');

// Tareas programadas
require('./cron/habitCron');

const userRoutes = require('./routes/user.routes');
const habitRoutes = require('./routes/habit.routes');

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
app.use('/api/habit', habitRoutes);
app.use(express.static(path.join(__dirname, '/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT,() =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

exports.app = app;
