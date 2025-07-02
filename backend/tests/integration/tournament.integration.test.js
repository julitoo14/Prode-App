const request = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const Competition = require("../../models/Competition");
const Tournament = require("../../models/Tournament");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { isReadable } = require("supertest/lib/test");
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

describe("POST /tournament", () => {
    it("should create a tournament and return it", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const res = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        expect(res.status).toBe(201);

        const tournament = await request(app)
            .get(`/tournament/${res.body.tournament._id}`)
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");

        expect(tournament.status).toBe(200);
        expect(tournament.body.tournament).toHaveProperty(
            "name",
            "Test Tournament"
        );
        expect(tournament.body.tournament).toHaveProperty(
            "competition.name",
            "Test Competition"
        );
        expect(tournament.body.tournament).toHaveProperty(
            "creator.userName",
            "TestUser"
        );
        expect(tournament.body.tournament).toHaveProperty(
            "password",
            "12345678"
        );
        expect(tournament.body.tournament).toHaveProperty("status", "pending");
        expect(tournament.body.tournament).toHaveProperty("rules", "default");
    });

    it("should not create a tournament with inexistent competition", async () => {
        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const res = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: "665eaa457af29df1faaa1234",
                creator: userId,
                password: "12345678",
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Error creating tournament");
    });

    it("should not create a tournament with invalid competition id", async () => {
        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const res = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: "invalid-id-string",
                creator: userId,
                password: "12345678",
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Validation error");
    });

    it("should not get a tournament with inexistent id", async () => {
        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;
        const res = await request(app)
            .get("/tournament/665eaa457af29df1faaa1234")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Tournament not found");
    });

    it("should update a tournament", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const tournament = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        const res = await request(app)
            .put(`/tournament/${tournament.body.tournament._id}`)
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Updated Tournament",
                status: "active",
                rules: "partial",
                password: "123456789",
            });

        expect(res.status).toBe(200);
        expect(res.body.tournament).toHaveProperty(
            "name",
            "Updated Tournament"
        );
        expect(res.body.tournament).toHaveProperty(
            "competition",
            competition._id.toString()
        );
        expect(res.body.tournament).toHaveProperty(
            "creator",
            userId.toString()
        );
        expect(res.body.tournament).toHaveProperty("password", "123456789");
        expect(res.body.tournament).toHaveProperty("status", "active");
        expect(res.body.tournament).toHaveProperty("rules", "partial");
    });

    it("should not update a tournament with invalid id", async () => {
        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;

        const res = await request(app)
            .put("/tournament/665eaa457af29df1faaa1234")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Updated Tournament",
                status: "active",
                rules: "partial",
                password: "123456789",
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Tournament not found");
    });

    it("should not update a tournament with invalid params", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = login.body.user._id;

        const tournament = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        const res = await request(app)
            .put(`/tournament/${tournament.body.tournament._id}`)
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "",
            });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Validation error");
    });

    it("should delete a tournament", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const tournament = await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        const res = await request(app)
            .delete(`/tournament/${tournament.body.tournament._id}`)
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");

        expect(res.status).toBe(204);
        expect(
            await Tournament.findById(tournament.body.tournament._id)
        ).toBeNull();
    });

    it("should not delete a tournament if user is not creator", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        const tournament = await request(app)
            .post("/tournament")
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        const secondUser = await request(app).post("/auth/register").send({
            userName: "TestUser2",
            email: "test2@test.com",
            password: "12345678",
        });

        const secondLogin = await request(app).post("/auth/login").send({
            email: "test2@test.com",
            password: "12345678",
        });

        const secondToken = secondLogin.body.token;
        const secondUserId = secondUser.body.user._id;

        const res = await request(app)
            .delete(`/tournament/${tournament.body.tournament._id}`)
            .set("Authorization", `${secondToken}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe(
            "User is not the creator of the tournament"
        );
        expect(
            await Tournament.findById(tournament.body.tournament._id)
        ).toBeDefined();
    });

    it("should get all tournaments", async () => {
        const competition = await Competition.create({
            name: "Test Competition",
        });

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;
        const userId = user.body.user._id;

        await request(app)
            .post("/tournament")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                name: "Test Tournament",
                competition: competition._id,
                creator: userId,
                password: "12345678",
            });

        const res = await request(app)
            .get("/tournament/all")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        expect(res.status).toBe(200);
        expect(res.body.tournaments.length).toBe(1);
        expect(res.body.tournaments[0]).toHaveProperty(
            "name",
            "Test Tournament"
        );
    });

    it("should return status code 400 if no tournaments", async () => {

        const user = await request(app).post("/auth/register").send({
            userName: "TestUser",
            email: "test@test.com",
            password: "12345678",
        });

        const login = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "12345678",
        });

        const token = login.body.token;

        const res = await request(app)
            .get("/tournament/all")
            .set("Authorization", `${token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        expect(res.status).toBe(400);
    });
});
