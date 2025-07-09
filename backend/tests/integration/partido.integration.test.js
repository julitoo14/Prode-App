const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Competition = require('../../models/Competition');
const { registerAndLogin } = require('../../helpers/test.api');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

describe('Partido Integration Tests', () => {
    let token, userId, competition, partido;

    beforeAll(async () => {
        // Connect to MongoDB in memory
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        // Delete all data from the database
        await User.deleteMany({});
        await Competition.deleteMany({});
        // Create a competition
        competition = await Competition.create({
            name: 'Test Competition',
        });
        // Register and login
        ({ token, userId } = await registerAndLogin());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('POST /partido', () => {
        it('should create a new partido', async () => {
            const res = await request(app)
                .post('/partido')
                .set('Authorization', `${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    fecha: new Date(),
                    competition: competition._id,
                    equipo1: 'Equipo 1',
                    equipo2: 'Equipo 2',
                    golesEquipo1: 1,
                    golesEquipo2: 2,
                    status: 'pending'
                });
            partido = res.body.partido;

            expect(res.status).toBe(201);
            expect(res.body.partido).toHaveProperty('competition', competition._id.toString());
            expect(res.body.partido).toHaveProperty('equipo1', 'Equipo 1');
            expect(res.body.partido).toHaveProperty('equipo2', 'Equipo 2');
        });

        it('should return 400 for invalid partido data', async () => {
            const res = await request(app)
                .post('/partido')
                .set('Authorization', `${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    fecha: 'invalid-date',
                    competition: competition._id,
                    equipo1: 'Equipo 1',
                    equipo2: 'Equipo 2',
                    golesEquipo1: 1,
                    golesEquipo2: 2,
                    status: 'pending'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('GET /partido/:id', () => {
        it('should retrieve a partido by ID', async () => {
            const partido1 = await request(app)
                .post('/partido')
                .set('Authorization', `${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    fecha: new Date(),
                    competition: competition._id,
                    equipo1: 'Equipo 1',
                    equipo2: 'Equipo 2',
                    golesEquipo1: 1,
                    golesEquipo2: 2,
                    status: 'pending'
                });

            const res = await request(app)
                .get(`/partido/${partido1.body.partido._id}`)
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.partido).toHaveProperty('_id', partido1.body.partido._id.toString());
            expect(res.body.partido).toHaveProperty('competition', competition._id.toString());
        });

        it('should return 404 for non-existing partido', async () => {
            const res = await request(app)
                .get('/partido/60d5f484f1b2c8b8f8e4c8c8')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(404);
        });
    });

    describe('Get /partido/all', () => {
        it('should retrieve all partidos', async () => {
            const res = await request(app)
                .get('/partido/all')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.partidos).toBeInstanceOf(Array);
            expect(res.body.partidos.length).toBeGreaterThan(0);
        })
    });

    describe('PUT /partido/:id', () => {
        it('should update a partido', async () => {
            const res = await request(app)
                .put(`/partido/${partido._id}`)
                .set('Authorization', `${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    golesEquipo1: 3,
                    golesEquipo2: 1,
                    status: 'finished'
                });
            console.log(res.body)
            expect(res.status).toBe(200);
            expect(res.body.partido).toHaveProperty('golesEquipo1', 3);
            expect(res.body.partido).toHaveProperty('golesEquipo2', 1);
            expect(res.body.partido).toHaveProperty('status', 'finished');
        });

        it('should return 404 for non-existing partido on update', async () => {
            const res = await request(app)
                .put('/partido/60d5f484f1b2c8b8f8e4c8c8')
                .set('Authorization', `${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    golesEquipo1: 3,
                    golesEquipo2: 1,
                    status: 'finished'
                });

            expect(res.status).toBe(404);
        });
    })

    describe('DELETE /partido/:id', () => {
        it('should delete a partido', async () => {
            const res = await request(app)
                .delete(`/partido/${partido._id}`)
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(204);
        });

        it('should return 404 for non-existing partido on delete', async () => {
            const res = await request(app)
                .delete('/partido/60d5f484f1b2c8b8f8e4c8c8')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(404);
        });
    })

});