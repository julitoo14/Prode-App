const Prediction = require('../models/Prediction');
const Participante = require('../models/Participante');
const Partido = require('../models/Partido');
const AppError = require('../utils/AppError');

const updateScore = async (partidoId) => {
    // busco el partido por ID y verifico que exista y esté terminado
    const partido = await Partido.findById(partidoId);
    if (!partido) {
        throw new AppError(404, 'Partido not found');
    }
    if (partido.status !== 'finished') {
        throw new AppError(400, 'Partido is not finished yet');
    }
    // busco todas las predicciones del partido
    const predictions = await Prediction.find({ partido: partidoId })
        .populate({
            path: 'participante',
            populate: {
                path: 'tournament'
            }
        });
    // recorro las predicciones y actualizo los puntajes
    for (const prediction of predictions) {
        const participante = prediction.participante;
        const tournament = participante.tournament;
        const rules = tournament.rules;
        let score = 0;
        // Determino el ganador de la predicción y del partido
        const predictionWinner = prediction.golesEquipo1 > prediction.golesEquipo2 ? 'equipo1' : (prediction.golesEquipo1 < prediction.golesEquipo2 ? 'equipo2' : 'draw');
        const partidoWinner = partido.golesEquipo1 > partido.golesEquipo2 ? 'equipo1' : (partido.golesEquipo1 < partido.golesEquipo2 ? 'equipo2' : 'draw');
        // Verifico si la predicción es exacta
        if (prediction.golesEquipo1 === partido.golesEquipo1 && prediction.golesEquipo2 === partido.golesEquipo2) {
            score = 3;
            prediction.status = 'correct';
        } else {
            // Si no es exacta, verifico según las reglas del torneo
            switch (rules) {
                // 'default' es 1 punto por acertar el ganador
                case 'default':
                    if (predictionWinner === partidoWinner) {
                        score = 1;
                        prediction.status = 'correct';
                    } else {
                        prediction.status = 'incorrect';
                    }
                    break;
                case 'partial': // 1 punto por acertar el ganador y 1 punto extra si acierta al menos un gol
                    if (predictionWinner === partidoWinner) {
                        score = 1;
                        if (prediction.golesEquipo1 === partido.golesEquipo1 || prediction.golesEquipo2 === partido.golesEquipo2) {
                            score++;
                        }
                        prediction.status = 'correct';
                    } else {
                        prediction.status = 'incorrect';
                    }
                    break;
                case 'difference': // 1 punto por acertar el ganador y 1 punto extra si acierta la diferencia de goles
                    if (predictionWinner === partidoWinner) {
                        score = 1;
                        // Verifico la diferencia de goles
                        const predictionDiff = prediction.golesEquipo1 - prediction.golesEquipo2;
                        const partidoDiff = partido.golesEquipo1 - partido.golesEquipo2;
                        if (predictionDiff === partidoDiff) {
                            score++;
                        }
                        prediction.status = 'correct';
                    } else {
                        prediction.status = 'incorrect';
                    }
                    break;
            }
        }

        if (participante) { // Actualizo el puntaje del participante
            participante.points += score;
            await participante.save();
        }
        await prediction.save();
    }
}

module.exports = {
    updateScore
}