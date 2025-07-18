const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const axios = require('axios');
const { DateTime } = require('luxon');
const Competition = require('../models/Competition');
const Partido = require('../models/Partido');
const scoreService = require('./scoreService');
const API_KEY = process.env.SPORTSDB_API_KEY;

const syncPartidos = async () => {
    let competitions;
    try {
        competitions = await Competition.find();
    } catch (error) {
        console.error('Error al obtener competiciones:', error);
        return;
    }

    for (const comp of competitions) {
        try {
            const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${comp.externalId}&s=2025`;
            const { data } = await axios.get(url);
            const matches = data?.events || [];

            for (const m of matches) {
                try {
                    const existingMatch = await Partido.findOne({ externalId: m.idEvent });
                    const previousStatus = existingMatch ? existingMatch.status : null;

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
                        fechaUTC = new Date(m.strTimestamp);
                    }

                    const updatedMatchData = {
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
                        status: m.strStatus,
                        videoUrl: m.strVideo || '',
                    };

                    const updatedMatch = await Partido.findOneAndUpdate(
                        { externalId: m.idEvent },
                        updatedMatchData,
                        { upsert: true, new: true }
                    );

                    if (
                        updatedMatch &&
                        previousStatus !== 'Match Finished' &&
                        updatedMatch.status === 'Match Finished'
                    ) {
                        try {
                            console.log(`El partido ${updatedMatch.externalId} ha finalizado. Actualizando puntajes...`);
                            await scoreService.updateScore(updatedMatch._id);
                        } catch (error) {
                            console.error(`Error al actualizar puntajes para el partido ${updatedMatch.externalId}:`, error);
                        }
                    }
                } catch (matchError) {
                    console.error(`Error procesando partido ${m.idEvent} de la competencia ${comp.name}:`, matchError);
                }
            }
        } catch (compError) {
            console.error(`Error al sincronizar partidos para la competencia ${comp.name}:`, compError);
        }
    }
};

module.exports = syncPartidos;
