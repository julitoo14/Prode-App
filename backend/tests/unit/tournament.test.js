const mongoose = require('mongoose');
const { MongoMemoryServer } = require("mongodb-memory-server");
const tournamentService = require('../../services/tournamentService');
const Tournament = require('../../models/Tournament');
const Competition = require('../../models/Competition');
const User = require('../../models/User');
let mongoServer;

// Configuración de la base de datos de prueba
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Competition.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Tournament.deleteMany({});
    await Competition.deleteMany({});
});

test('should create a tournament', async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });

    const user = await User.create({
        userName: 'Test User',
        password: 'Test Password',
        email: 'test@test.com',
    });

    const tournament = await tournamentService.createTournament({
        name: 'Test Tournament',
        competition: competition._id,
        creator: user._id,
        password: 'Test',
    });

    expect(tournament).toBeDefined();
    expect(tournament.name).toBe('Test Tournament');
    expect(tournament.competition).toBe(competition._id);
    expect(tournament.creator).toBe(user._id);
    expect(tournament.password).toBe('Test');
});

test('should not create a tournament with invalid competition', async () => {
    await expect(tournamentService.createTournament({
        name: 'Test Tournament',
        competition: 'invalid-id-string',
        creator: 'invalid-id-string',
        password: 'Test',
    })).rejects.toThrow();
});

