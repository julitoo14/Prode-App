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

test('Should not create a tournament with inexistent creator', async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });

    await expect(tournamentService.createTournament({
        name: 'Test Tournament',
        competition: competition._id,
        creator: '665eaa457af29df1faaa1234',
        password: 'Test',
    })).rejects.toThrow('Creator not found');
});

test('Should not create a tournament with existent name', async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });
    
    const user = await User.create({
        userName: 'Test User',
        password: 'Test Password',
        email: 'test@test.com',
    });

    await tournamentService.createTournament({
        name: 'Test Tournament',
        competition: competition._id,
        creator: user._id,
        password: 'Test',
    });

    await expect(tournamentService.createTournament({
        name: 'Test Tournament',
        competition: competition._id,
        creator: user._id,
        password: 'Test',
    })).rejects.toThrow('Tournament already exists');
    
    
    
});

test('should not create a tournament with invalid competition', async () => {
    await expect(tournamentService.createTournament({
        name: 'Test Tournament',
        competition: 'invalid-id-string',
        creator: 'invalid-id-string',
        password: 'Test',
    })).rejects.toThrow();
});

test('should get an existing tournament', async () => {
    
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

    const retrievedTournament = await tournamentService.getTournament(tournament._id);

    expect(retrievedTournament).toBeDefined();
    expect(retrievedTournament.name).toBe('Test Tournament');
    expect(retrievedTournament.competition.name).toBe('Test Competition');
    expect(retrievedTournament.creator.userName).toBe('Test User');
    expect(retrievedTournament.password).toBe('Test');
});

test('should not get a tournament with invalid id', async () => {
    await expect(tournamentService.getTournament('invalid-id-string')).rejects.toThrow();
});

test('should update a tournament if user is creator', async () => {
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

    const updatedTournament = await tournamentService.updateTournament(tournament._id, user._id, {
        name: 'Updated Tournament',
    });

    expect(updatedTournament).toBeDefined();
    expect(updatedTournament.name).toBe('Updated Tournament');
    expect(updatedTournament.password).toBe('Test');
});

test('should not update a tournament if user is not creator', async () => {
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
    
    const user2 = await User.create({
        userName: 'Test User 2',
        password: 'Test Password 2',
        email: 'test2@test.com',
    });

    await expect(tournamentService.updateTournament(tournament._id, user2._id, {
        name: 'Updated Tournament',
    })).rejects.toThrow('User is not the creator of the tournament');
});

test('should not update a tournament with invalid id', async () => {
    await expect(tournamentService.updateTournament('invalid-id-string', 'invalid-id-string', {
        name: 'Updated Tournament',
    })).rejects.toThrow();
});

test('should delete a tournament if user is creator', async () => {
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

    expect(await Tournament.findById(tournament._id)).toBeDefined();
    await tournamentService.deleteTournament(tournament._id, user._id);
    expect(await Tournament.findById(tournament._id)).toBeNull();
});


test('should not delete a tournament if user is not creator', async () => {
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
    
    const user2 = await User.create({
        userName: 'Test User 2',
        password: 'Test Password 2',
        email: 'test2@test.com',
    });

    await expect(tournamentService.deleteTournament(tournament._id, user2._id)).rejects.toThrow('User is not the creator of the tournament');
});

test('should not delete a tournament with invalid id', async () => {
    await expect(tournamentService.deleteTournament(new mongoose.Types.ObjectId('665eaa457af29df1faaa1234'), new mongoose.Types.ObjectId('665eaa457af29df1faaa1234'))).rejects.toThrow('Tournament not found');
});

test('should return all tournaments' ,async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });
    
    const user = await User.create({
        userName: 'Test User',
        password: 'Test Password',
        email: 'test@test.com',
    });

    await tournamentService.createTournament({
        name: 'Test Tournament',
        competition: competition._id,
        creator: user._id,
        password: 'Test',
    });
    const tournaments = await tournamentService.getAll();
    expect(tournaments.length).toBe(1);
    expect(tournaments[0]).toBeDefined();
    expect(tournaments[0].password).toBeUndefined();
});

test('should return error if no tournaments registered', async() => {
    await expect(tournamentService.getAll()).rejects.toThrow('No tournaments found')
})

