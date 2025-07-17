const mongoose = require('mongoose');
const dotenv = require('dotenv');
const syncCompetitions = require('../services/syncCompetitions');
const syncPartidos = require('../services/syncPartidos');
dotenv.config({path:'../.env'});

(async () => {
    try {
        const user= process.env.DB_USER;
        const password= process.env.DB_PASSWORD;
        const databaseName = 'production';
        console.log(`${user}@${password}@${databaseName}@`);
        await mongoose.connect(`mongodb+srv://${user}:${password}@primary.imymk61.mongodb.net/?retryWrites=true&w=majority&appName=Primary`,
            {dbName: databaseName});
        console.log('connected to database ' + databaseName);

        await syncCompetitions();
        console.log('Competitions synced');

        await syncPartidos();
        console.log('Matches synced');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
