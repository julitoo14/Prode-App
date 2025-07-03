const request = require("supertest");
const app = require("../../app");
const Competition = require("../../models/Competition");
const User = require('../../models/User')
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Competition.deleteMany({});
    await User.deleteMany({})
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Competition.deleteMany();
    await User.deleteMany();
});

describe('POST /competition', () => {
    it('Should create a new competition', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        })
        const token = login.body.token;

        const res = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        expect(res.status).toBe(201);
        expect(res.body.competition.name).toBe('Copa Test');
        expect(res.body.competition.format).toBe('cup');
        expect(res.body.competition.image).toBeNull();
        expect(res.body.competition.createdAt).toBeDefined();
        expect(res.body.competition.updatedAt).toBeDefined();
    });

    it('Should return Validation error if name is not provided', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({})

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Validation error');
    });

    it('Should return error if name is already taken', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        const res = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Competition Name Already Taken');
    })
});

describe('GET /competition', () => {
    it('Should return all competitions', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        const res = await request(app).get('/competition/all')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(200);
        expect(res.body.competitions.length).toBe(1);
        expect(res.body.competitions[0].name).toBe('Copa Test');
        expect(res.body.competitions[0].format).toBe('cup');
        expect(res.body.competitions[0].image).toBeNull();
        expect(res.body.competitions[0].createdAt).toBeDefined();
        expect(res.body.competitions[0].updatedAt).toBeDefined();
    });

    it('Should return error if no competitions are found', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).get('/competition/all')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Competitions not found');
    });

    it('Should return a competition by id', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const competition = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        const res = await request(app).get(`/competition/${competition.body.competition._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(200);
        expect(res.body.competition.name).toBe('Copa Test');
        expect(res.body.competition.format).toBe('cup');
    });

    it('Should return 404 error if competition is not found', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).get(`/competition/668061111111111111111111`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Competition not found');
    })

    it('Should return 400 error if id is not a valid object id', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).get(`/competition/1234567890`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(400);
    })
});

describe('PUT /competition', () => {
    it('Should update a competition', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const competition = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        const res = await request(app).put(`/competition/${competition.body.competition._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test Updated'})

        expect(res.status).toBe(200);
        expect(res.body.competition.name).toBe('Copa Test Updated');
        expect(res.body.competition.format).toBe('cup');
        expect(res.body.competition.image).toBeNull();
        expect(res.body.competition.createdAt).toBeDefined();
        expect(res.body.competition.updatedAt).toBeDefined();
    })

    it('Should return 404 error if competition is not found', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).put(`/competition/668061111111111111111111`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test Updated'})

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Competition not found');
    })
})

describe('DELETE /competition', () => {
    it('Should delete a competition', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const competition = await request(app).post('/competition')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({name: 'Copa Test'})

        const res = await request(app).delete(`/competition/${competition.body.competition._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(204);
    })

    it('Should return 404 error if competition is not found', async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post('/auth/login').send({
            email: "test@test.com",
            password: "12345678"
        });
        const token = login.body.token;

        const res = await request(app).delete(`/competition/668061111111111111111111`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Competition not found');
    })
})