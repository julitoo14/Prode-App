const mongoose = require('mongoose');
const {MongoMemoryServer} = require("mongodb-memory-server");
const participanteService = require('../../services/participanteService');
const Participante = require('../../models/Participante')
const User = require('../../models/User')
const Tournament = require('../../models/Tournament')
const Competition = require('../../models/Competition')
let mongoServer;
let user;
let competition;
let tournament;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Participante.deleteMany({});
    // Creamos un usuario, un torneo y una competicion
    user = await User.create({
        userName: 'TestUser',
        email: 'test@test.com',
        password: '12345678'
    });
    competition = await Competition.create({
        name: 'Copa Test',
        format: 'cup'
    });
    tournament = await Tournament.create({
        name: 'Torneo Test',
        competition: competition._id,
        creator: user._id,
        password: '12345678'
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Participante.deleteMany({});
});


// POST
test('Should create a new participante', async () => {
    const newParticipante = await participanteService.create(user._id, tournament._id);
    expect(newParticipante).toHaveProperty('name', user.userName);
    expect(newParticipante).toHaveProperty('user', user._id);
    expect(newParticipante).toHaveProperty('tournament', tournament._id);
    expect(newParticipante).toHaveProperty('points', 0);
    expect(newParticipante).toHaveProperty('exactPredictions', 0);
    expect(newParticipante).toHaveProperty('partialPredictions', 0);
});

test('Should return 404 error if user not found', async () => {
    await expect(participanteService.create('668061111111111111111111', tournament._id)).rejects.toThrow('User not found');
});

test('Should return 404 error if tournament not found', async () => {
    await expect(participanteService.create(user._id, '668061111111111111111111')).rejects.toThrow('Tournament not found');
});

test('Should return 400 error if participante already enrolled', async () => {
    await participanteService.create(user._id, tournament._id);
    await expect(participanteService.create(user._id, tournament._id)).rejects.toThrow('Participante already enrolled');
});

// GET
test('Should return all participantes', async () => {
    const participantes = await participanteService.getAll();
    expect(participantes).toHaveLength(0);
});

test('Should return a participante by id', async () => {
    const newParticipante = await participanteService.create(user._id, tournament._id);
    const participante = await participanteService.getById(newParticipante._id);
    expect(participante).toHaveProperty('name', newParticipante.name);
    expect(participante).toHaveProperty('user', newParticipante.user);
    expect(participante).toHaveProperty('tournament', newParticipante.tournament);
    expect(participante).toHaveProperty('points', newParticipante.points);
    expect(participante).toHaveProperty('exactPredictions', newParticipante.exactPredictions);
    expect(participante).toHaveProperty('partialPredictions', newParticipante.partialPredictions);
});

test('Should return 404 error if participante not found', async () => {
    await expect(participanteService.getById('668061111111111111111111')).rejects.toThrow('Participante not found');
});

// DELETE
test('Should delete a participante', async () => {
    const newParticipante = await participanteService.create(user._id, tournament._id);
    const deletedParticipante = await participanteService.deleteParticipante(newParticipante._id, tournament._id, user._id);
    expect(deletedParticipante).toBe(true);
    const participantes = await participanteService.getAll();
    expect(participantes).toHaveLength(0);
});

test('Should return 404 error if participante not found', async () => {
    const newParticipante = await participanteService.create(user._id, tournament._id);
    await expect(participanteService.deleteParticipante('668061111111111111111111', tournament._id, user._id)).rejects.toThrow('Participante not found');
    await expect(participanteService.deleteParticipante(newParticipante._id, '668061111111111111111111', user._id)).rejects.toThrow('Participante not found');
    await expect(participanteService.deleteParticipante(newParticipante._id, tournament._id, '668061111111111111111111')).rejects.toThrow('Participante not found');
});

