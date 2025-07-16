const Partido = require('../models/Partido')
const Tournament = require('../models/Tournament')
const Competition = require('../models/Competition')
const Participante = require('../models/Participante')
const User = require('../models/User')

async function createUser(overrides = {}) {
    return await User.create({
        userName: 'TestUser',
        email: 'test@example.com',
        password: 'password',
        ...overrides,
    });
}

async function createCompetition(overrides = {}) {
    return await Competition.create({
        name: 'Test Competition',
        format: 'League',
        ...overrides,
    });
}

async function createTournament(competition, user, overrides = {}) {
    return await Tournament.create({
        name: 'Test Tournament',
        competition: competition._id,
        creator: user._id,
        password: '1234',
        ...overrides,
    });
}

async function createPartido(competition, overrides = {}) {
    return await Partido.create({
        fecha: new Date(),
        equipo1: 'Team A',
        equipo2: 'Team B',
        competition: competition._id,
        golesEquipo1: 0,
        golesEquipo2: 0,
        status: 'pending',
        ...overrides,
    });
}

async function createParticipante(user, tournament, overrides = {}) {
    return await Participante.create({
        name: user.userName,
        user: user._id,
        tournament: tournament._id,
        ...overrides,
    });
}

const Prediction = require('../models/Prediction');

async function createPrediction(partido, participante, golesEquipo1, golesEquipo2) {
    return await Prediction.create({
        partido: partido._id,
        participante: participante._id,
        golesEquipo1,
        golesEquipo2,
    });
}

module.exports = {
    createUser,
    createTournament,
    createCompetition,
    createPartido,
    createParticipante,
    createPrediction,
}