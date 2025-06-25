const request = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const Competition = require("../../models/Competition");
const Tournament = require("../../models/Tournament");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Competition.deleteMany({});
    await Tournament.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany();
    await Competition.deleteMany();
    await Tournament.deleteMany();
});

describe('POST /tournament', () => {
    it('should create a tournament', async () => {
        const competition = await Competition.create({
            name: 'Test Competition',
        });

        const user = await request(app).post('/auth/register').send({
            userName: 'TestUser',
            email: 'test@test.com',
            password: '12345678',
        });

        const login = await request(app).post('/auth/login').send({
            email: 'test@test.com',
            password: '12345678',
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const res = await request(app)
        .post('/tournament')
        .set('Authorization', `${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            name: 'Test Tournament',
            competition: competition._id,
            creator: userId,
            password: '12345678',
        });

        expect(res.status).toBe(201);
        expect(res.body.tournament).toHaveProperty('name', 'Test Tournament');
        expect(res.body.tournament).toHaveProperty('competition', competition._id.toString());
        expect(res.body.tournament).toHaveProperty('creator', userId);
        expect(res.body.tournament).toHaveProperty('password', '12345678');
        expect(res.body.tournament).toHaveProperty('status', 'pending');
        expect(res.body.tournament).toHaveProperty('rules', 'default');
    });

    it('should not create a tournament with invalid competition', async () => {
        const user = await request(app).post('/auth/register').send({
            userName: 'TestUser',
            email: 'test@test.com',
            password: '12345678',
        });

        const login = await request(app).post('/auth/login').send({
            email: 'test@test.com',
            password: '12345678',
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const res = await request(app)
        .post('/tournament')
        .set('Authorization', `${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            name: 'Test Tournament',
            competition: 'invalid-id-string',
            creator: userId,
            password: '12345678',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Validation error');
    });
});
