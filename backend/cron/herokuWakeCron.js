const cron = require('node-cron');
const axios = require('axios');

cron.schedule('45 23 * * *', async () => {
    try {
        await axios.get('https://habits-app-3f31c469a984.herokuapp.com/');
        console.log('Manteniendo la app despierta con un curl a las 11:45 p.m.');
    } catch (error) {
        console.error('Error al hacer curl a la app:', error);
    }
}, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
});
