const mongoose = require('mongoose');
const {MongoMemoryServer} = require("mongodb-memory-server");
const competitionService = require('../../services/competitionService');
const Competition = require('../../models/Competition')
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
    await Competition.deleteMany({});
});

// POST
test('Should Create a new Competition', async () =>{
    const newCompetition = await competitionService.create({
        name: 'Copa Libertadores',
        format: 'Cup'
    })
    expect(newCompetition).toHaveProperty('name', 'Copa Libertadores');
    expect(newCompetition).toHaveProperty('format', 'Cup');
    expect(newCompetition.image).toBeNull();
});

test('Should reject if name already taken', async () => {
    await competitionService.create({
        name: 'Torneo Argentino'
    });

    await expect(competitionService.create({name: 'Torneo Argentino'})).rejects.toThrow('Competition Name Already Taken');
});

test('Should return validation error if short name', async () => {
    await expect(competitionService.create({name: 'abc'})).rejects.toThrow('Validation error');
});

// GET
test('Should get a competition by ID', async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });

    const res = await competitionService.getById(competition._id);
    expect(res).toHaveProperty('name', 'Test Competition');
});

test('Should reject when no competition found', async () => {
    await expect(competitionService.getById('78729ebff293a56dd0cc2e3b')).rejects.toThrow('Competition not found');
})

test('Should get all competitions', async () => {
    await Competition.create({
        name: 'Copa Libertadores 2025'
    })
    await Competition.create({
        name: 'Torneo Clausura Argentino 2025',
        format: 'league'
    })
    

    const competitions = await competitionService.getCompetitions();
    expect(competitions.length).toBe(2);
})

test('Should reject when no competitions', async () => {
    await expect(competitionService.getCompetitions()).rejects.toThrow('Competitions not found')
})

//PUT 

test('Should update a competition', async () => {
    const c = await Competition.create({
        name: 'Torneo Argentino',
        format: 'league'
    })

    const competition = await competitionService.editCompetition(c._id, {name: 'Copa Libertadores', format: 'cup'});
    expect(competition).toHaveProperty('name', 'Copa Libertadores');
    expect(competition).toHaveProperty('format', 'cup');
})

test('Should reject if no rquired params', async() => {
    const c = await Competition.create({
        name: 'Torneo Argentino',
        format: 'league'
    })

    await expect(competitionService.editCompetition(c._id, {test: 'wrong'})).rejects.toThrow('Validation error');
})

test('Should reject if competition not found', async() => {
    await expect(competitionService.editCompetition('78729ebff293a56dd0cc2e3b', {name: 'Copa Libertadores', format: 'cup'})).rejects.toThrow('Competition not found')
})

// DELETE
test('Should delete competition', async () => {
    const c = await Competition.create({ name: 'Torneo Argentino', format: 'league' });
  
    await expect(Competition.findById(c._id).exec()).resolves.not.toBeNull();
    await competitionService.deleteCompetition(c._id);
    await expect(Competition.findById(c._id).exec()).resolves.toBeNull();
});

test('Should reject if no competition found', async() => {
    await expect(competitionService.deleteCompetition('78729ebff293a56dd0cc2e3b')).rejects.toThrow('Competition not found')
})
  