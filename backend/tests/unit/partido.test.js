const mongoose = require('mongoose')
const { MongoMemoryServer } = require("mongodb-memory-server");
const Partido = require('../../models/Partido')
const partidoService = require('../../services/partidoService');
const Competition = require('../../models/Competition')
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Partido.deleteMany({});
    await Competition.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Partido.deleteMany({});
    await Competition.deleteMany({});
});

beforeEach(async () => {
    await Partido.deleteMany({});
    await Competition.deleteMany({});
});

test('should create a partido', async () => {
    const competition = await Competition.create({
        name: 'Test Competition',
    });

    const partido = await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    })

    expect(partido).toBeDefined();
    expect(partido.fecha).toBeInstanceOf(Date);
    expect(partido.competition).toBe(competition._id);
    expect(partido.equipo1).toBe('Equipo 1');
    expect(partido.equipo2).toBe('Equipo 2');
    expect(partido.golesEquipo1).toBe(1);
    expect(partido.golesEquipo2).toBe(2);
    expect(partido.status).toBe('pending');
})

test('should get a partido by id', async () => {
    const competition = await Competition.create({ name: 'Test Competition' });
    const partidoCreado = await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    });

    const partido = await partidoService.getById(partidoCreado._id);
    expect(partido).toBeDefined();
    expect(partido._id.toString()).toBe(partidoCreado._id.toString());
});

test('should get an error if the partido is not found', async () => {
    await expect(partidoService.getById('668868686868686868686868')).rejects.toThrow('Partido not found');
});


test('should get all partidos', async () => {
    const competition = await Competition.create({ name: 'Test Competition' });
    await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    });
    await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 3',
        equipo2: 'Equipo 4',
        golesEquipo1: 0,
        golesEquipo2: 0,
        status: 'pending'
    });

    const partidos = await partidoService.getAll();
    expect(partidos.length).toBe(2);
});


test('should update a partido', async () => {
    const competition = await Competition.create({ name: 'Test Competition' });
    const partidoCreado = await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    });

    const updated = await partidoService.update(partidoCreado._id, { golesEquipo1: 3, status: 'finished' });
    expect(updated.golesEquipo1).toBe(3);
    expect(updated.status).toBe('finished');
    expect(updated.golesEquipo1).toBe(3);
    expect(updated.golesEquipo2).toBe(2);
});

test('should get an error if the partido is not found', async () => {
    await expect(partidoService.update('668868686868686868686868', { golesEquipo1: 3, status: 'finished' })).rejects.toThrow('Partido not found');
});

test('should get an error if zod validation fails', async () => {
    const competition = await Competition.create({ name: 'Test Competition' });
    const partidoCreado = await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    });
    await expect(partidoService.update(partidoCreado._id, { golesEquipo1: '3', status: 3 })).rejects.toThrow('Invalid partido data');
});

test('should delete a partido', async () => {
    const competition = await Competition.create({ name: 'Test Competition' });
    const partidoCreado = await partidoService.create({
        fecha: new Date(),
        competition: competition._id,
        equipo1: 'Equipo 1',
        equipo2: 'Equipo 2',
        golesEquipo1: 1,
        golesEquipo2: 2,
        status: 'pending'
    });

    await partidoService.deletePartido(partidoCreado._id);
    const partido = await Partido.findById(partidoCreado._id);
    expect(partido).toBeNull();
});

test('should get an error if the partido is not found', async () => {
    await expect(partidoService.deletePartido('668868686868686868686868')).rejects.toThrow('Partido not found');
});

