const scoreService = require('../../services/scoreService');
const { createUser, createTournament, createParticipante, createPartido, createCompetition, createPrediction} = require('../../helpers/testHelpers');
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
let mongoServer;
let user;
let tournament;
let participante;
let competition;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    user = await createUser();
    competition = await createCompetition();
    tournament = await createTournament(competition, user);
    participante = await createParticipante(user, tournament);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('scoreService', () => {
    let partido;
    let tournament;
    beforeEach(async () => {
        await mongoose.model('Participante').updateOne({ _id: participante._id }, { $set: { points: 0 } });
        await mongoose.model('Prediction').deleteMany({});
        tournament = await createTournament(competition, user, { rules: 'default' });
        participante.tournament = tournament._id;
        await participante.save();
        partido = await createPartido(competition);
    });

    test('should update participant score with 3 points for correct prediction', async () => {
        await createPrediction(partido, participante, 2, 1);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(3);
    });

    test('should update participant score with 1 point for correct outcome', async () => {
        await createPrediction(partido, participante, 1, 0);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(1);
    });

    test('should update participant score with 0 points for incorrect prediction', async () => {
        await createPrediction(partido, participante, 0, 1);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(0);
    });

    test('should update participant score with 2 points for partial correct prediction', async () => {
        tournament.rules = 'partial';
        await tournament.save();

        await createPrediction(partido, participante, 3, 0);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 0;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(2);
    });

    test('should update participant score with 2 points for correct difference prediction', async () => {
        tournament.rules = 'difference';
        await tournament.save();

        await createPrediction(partido, participante, 2, 1);

        partido.golesEquipo1 = 1;
        partido.golesEquipo2 = 0;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(2);
    });

    test('should update participant score with 3 points for exact prediction with difference rule', async () => {
        tournament.rules = 'difference';
        await tournament.save();

        await createPrediction(partido, participante, 2, 2);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 2;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(3);
    })

    test('should update participant score with 0 points for incorrect prediction with difference rule', async () => {
        tournament.rules = 'difference';
        await tournament.save();

        await createPrediction(partido, participante, 1, 2);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(0);
    })

    test('should update participant score with 0 points for incorrect prediction with partial rule', async () => {
        tournament.rules = 'partial';
        await tournament.save();

        await createPrediction(partido, participante, 1, 2);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'Match Finished';
        await partido.save();

        await scoreService.updateScore(partido._id);

        const updatedParticipante = await mongoose.model('Participante').findById(participante._id);
        expect(updatedParticipante.points).toBe(0);
    })

    test('should not update score if match is not finished', async () => {
        await createPrediction(partido, participante, 2, 1);

        partido.golesEquipo1 = 2;
        partido.golesEquipo2 = 1;
        partido.status = 'pending';
        await partido.save();

        await expect(scoreService.updateScore(partido._id)).rejects.toThrow('Partido is not finished yet');
    })

    test('should throw error if match not found', async () => {
        await expect(scoreService.updateScore('64b9f2a6c3a0b67a2d1e4f98')).rejects.toThrow('Partido not found');
    });

});
