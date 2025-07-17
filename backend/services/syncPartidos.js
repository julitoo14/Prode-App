const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const axios = require('axios');
const { DateTime } = require('luxon'); // ✅ Agregado para manejo de fechas
const Competition = require('../models/Competition');
const Partido = require('../models/Partido');
const API_KEY = process.env.SPORTSDB_API_KEY;

const syncPartidos = async () => {
    const competitions = await Competition.find();

    for (const comp of competitions) {
        const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${comp.externalId}&s=2025`;
        const { data } = await axios.get(url);
        const matches = data?.events || [];

        for (const m of matches) {
            // ✅ Convertimos la fecha usando dateEventLocal + strTimeLocal
            let fechaUTC = null;
            if (m.dateEventLocal && m.strTimeLocal) {
                try {
                    fechaUTC = DateTime.fromFormat(
                        `${m.dateEventLocal} ${m.strTimeLocal}`,
                        'yyyy-MM-dd HH:mm:ss',
                        { zone: 'America/Argentina/Buenos_Aires' }
                    )
                        .toUTC()
                        .toJSDate();
                } catch (err) {
                    console.error('Error al convertir fecha:', m.dateEventLocal, m.strTimeLocal, err);
                }
            } else if (m.strTimestamp) {
                // fallback: usar strTimestamp si existe
                fechaUTC = new Date(m.strTimestamp);
            }
            await Partido.findOneAndUpdate(
                { externalId: m.idEvent },
                {
                    competition: comp._id,
                    externalId: m.idEvent,
                    fecha: fechaUTC,
                    round: m.intRound,
                    estadio: m.strVenue || 'Estadio Principal',
                    equipo1: m.strHomeTeam,
                    equipo1Image: m.strHomeTeamBadge || '',
                    equipo2: m.strAwayTeam,
                    equipo2Image: m.strAwayTeamBadge || '',
                    golesEquipo1: Number(m.intHomeScore) || 0,
                    golesEquipo2: Number(m.intAwayScore) || 0,
                    bannerUrl: m.strThumb || '',
                    status: m.strStatus || 'pending',
                    videoUrl: m.strVideo || '',
                },
                { upsert: true }
            );
        }
    }
};

module.exports = syncPartidos;
