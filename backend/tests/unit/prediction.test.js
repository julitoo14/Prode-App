const mongoose = require('mongoose')
const { MongoMemoryServer } = require("mongodb-memory-server");
const Prediction = require('../../models/Prediction');
const predictionService = require('../../services/predictionService');
const { createUser, createTournament, createParticipante, createPartido, createCompetition} = require('../../helpers/testHelpers');
let mongoServer;
let user;
let tournament;
let participante;
let competition;
let partido;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    user = await createUser();
    competition = await createCompetition();
    tournament = await createTournament(competition, user);
    participante = await createParticipante(user, tournament);
    partido = await createPartido(competition);
});

beforeEach(async () => {
    await Prediction.deleteMany({});
    const date = new Date();
    date.setMinutes(date.getMinutes() + 20);
    partido.fecha = date;
    await partido.save();
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});


test('should create a prediction', async () => {
    const result = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });
    expect(result).toHaveProperty('_id');
    expect(result.partido.toString()).toBe(partido._id.toString());
    expect(result.participante.toString()).toBe(participante._id.toString());
});

test('Should throw an error if prediction data is invalid', async () => {
    await expect(predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 'invalid', // Invalid data type
        golesEquipo2: 1
    })).rejects.toThrow('Invalid prediction data');
})

test('Should throw an error if prediction already exists', async () => {
    await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    await expect(predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 3,
        golesEquipo2: 2
    })).rejects.toThrow('Prediction already exists for this match and participant');
});

test('Should throw an error if participant does not exist', async () => {
    await expect(predictionService.create({
        participante: '64b9f2a6c3a0b67a2d1e4f98', // Non-existent participant
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    })).rejects.toThrow('Participante not found');
})

test('Should throw an error if invalid partido', async () => {
    await expect(predictionService.create({
        participante: participante._id,
        partido: '64b9f2a6c3a0b67a2d1e4f99', // Non-existent match
        golesEquipo1: 2,
        golesEquipo2: 1
    })).rejects.toThrow('Partido not found');
})

test('Should get a prediction by ID', async () => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    const foundPrediction = await predictionService.get(prediction._id);
    expect(foundPrediction).toBeDefined();
    expect(foundPrediction.participante.toString()).toBe(participante._id.toString());
    expect(foundPrediction.partido.toString()).toBe(partido._id.toString());
})

test('Should throw an error if prediction not found', async () => {
    await expect(predictionService.get('64b9f2a6c3a0b67a2d1e4f98')).rejects.toThrow('Prediction not found');
});

test('Should get all predictions for a participant', async () => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    const predictions = await predictionService.getByParticipante(participante._id);
    expect(predictions.length).toBe(1);
    expect(predictions[0]._id.toString()).toBe(prediction._id.toString());
})

test('Should get all predictions for a match', async () => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    })

    const predictions = await predictionService.getByPartido(partido._id);
    expect(predictions.length).toBe(1);
    expect(predictions[0]._id.toString()).toBe(prediction._id.toString());
})

test('Should update a prediction', async() => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1,
        status: 'pending'
    });

    const updatedPrediction = await predictionService.update(prediction._id, {golesEquipo1: 3, golesEquipo2: 1});

    expect(updatedPrediction.golesEquipo1).toBe(3);
    expect(updatedPrediction.golesEquipo2).toBe(1);
})

test('Should throw an error if prediction to update not found', async () => {
    await expect(predictionService.update('64b9f2a6c3a0b67a2d1e4f98', {golesEquipo1: 3, golesEquipo2: 1}))
        .rejects.toThrow('Prediction not found');
})

test('Should throw an error if invalid prediction data on update', async () => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    await expect(predictionService.update(prediction._id, {golesEquipo1: 'invalid', golesEquipo2: 1}))
        .rejects.toThrow('Invalid prediction data');
})

test('Should delete a prediction', async () => {
    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    const deletedPrediction = await predictionService.deletePrediction(prediction._id);
    expect(deletedPrediction).toBeDefined();
    expect(deletedPrediction._id.toString()).toBe(prediction._id.toString());

    const predictions = await predictionService.getByParticipante(participante._id);
    expect(predictions.length).toBe(0);
})

test('Should throw an error if prediction to delete not found', async () => {
    await expect(predictionService.deletePrediction('64b9f2a6c3a0b67a2d1e4f98'))
        .rejects.toThrow('Prediction not found');
})

test('Should throw an error if prediction is created less than 10 minutes before the match', async () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 8);
    partido.fecha = date;
    await partido.save();

    await expect(predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    })).rejects.toThrow('Prediction cannot be created less than 10 minutes before the match');
})

test('Should throw an error if prediction is updated less than 10 minutes before the match', async () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 11);
    partido.fecha = date;
    await partido.save();

    const prediction = await predictionService.create({
        participante: participante._id,
        partido: partido._id,
        golesEquipo1: 2,
        golesEquipo2: 1
    });

    const date2 = new Date();
    date2.setMinutes(date2.getMinutes() + 9);
    partido.fecha = date2;
    await partido.save();

    await expect(predictionService.update(prediction._id, {golesEquipo1: 3, golesEquipo2: 1}))
        .rejects.toThrow('Prediction cannot be updated less than 10 minutes before the match');
})