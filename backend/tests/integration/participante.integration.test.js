const request = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const Tournament = require("../../models/Tournament");
const Participante = require("../../models/Participante");
const Competition = require("../../models/Competition");
const { registerAndLogin } = require("../../helpers/test.api");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongoServer;

describe("Participante Integration Tests", () => {
    let token, userId, tournament, competition, participante;

    beforeAll(async () => {
        // Connect to MongoDB in memory
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        // Delete all data from the database
        await User.deleteMany({});
        await Tournament.deleteMany({});
        await Participante.deleteMany({});
        await Competition.deleteMany({});
        // Create a competition
        competition = await Competition.create({
            name: "Test Competition",
        });
        // Register and login
        ({ token, userId } = await registerAndLogin());
        // Create a tournament
        tournament = await Tournament.create({
            name: "Test Tournament",
            competition: competition._id,
            creator: userId,
            password: "12345678",
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe("POST /participante", () => {
        it("should create a new participante", async () => {
            const res = await request(app)
                .post("/participante")
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .send({
                    user: userId,
                    tournament: tournament._id,
                });
            participante = res.body.participante;

            expect(res.status).toBe(201);
            expect(res.body.participante).toHaveProperty(
                "user",
                userId.toString()
            );
            expect(res.body.participante).toHaveProperty(
                "tournament",
                tournament._id.toString()
            );
            expect(res.body.participante).toHaveProperty("points", 0);
            expect(res.body.participante).toHaveProperty("exactPredictions", 0);
            expect(res.body.participante).toHaveProperty(
                "partialPredictions",
                0
            );

            Participante.deleteOne({ _id: res.body.participante._id });
        });

        it("should return 400 if the userId is right but is not found in the database", async () => {
            const res = await request(app)
                .post("/participante")
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .send({
                    user: "66d810000000000000000000",
                    tournament: tournament._id,
                });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User not found");
        });

        it("should return 400 if the tournament is not found in the database", async () => {
            const res = await request(app)
                .post("/participante")
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .send({
                    user: userId,
                    tournament: "66d810000000000000000000",
                });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Tournament not found");
        });

        it("should return 400 if the user is already enrolled in the tournament", async () => {
            const res = await request(app)
                .post("/participante")
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .send({
                    user: userId,
                    tournament: tournament._id,
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Participante already enrolled");
        });
    });

    describe("GET /participante", () => {
        it("should return all participantes", async () => {
            const res = await request(app)
                .get("/participante/all")
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json");

            expect(res.status).toBe(200);
            expect(res.body.participantes).toBeDefined();
            expect(res.body.participantes.length).toBe(1);
            expect(res.body.participantes[0].user).toBe(userId.toString());
            expect(res.body.participantes[0].tournament).toBe(tournament._id.toString());
        });

        it("Should return a participante by id", async () => {
            const res = await request(app)
                .get(`/participante/${participante._id}`)
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json");

            expect(res.status).toBe(200);
            expect(res.body.participante).toBeDefined();
            expect(res.body.participante.user).toBe(userId.toString());
            expect(res.body.participante.tournament).toBe(tournament._id.toString());
        });

        it("Should return 404 if the participante is not found", async () => {
            const res = await request(app)
                .get(`/participante/66d810000000000000000000`)
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Participante not found");
        });
    });

    describe("DELETE /participante", () => {
        it("Should delete a participante", async () => {
            const res = await request(app)
                .delete(`/participante/${participante._id}/${tournament._id}`)
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json");
            expect(res.status).toBe(204);
        });

        it("Should return 404 if the participante is not found", async () => {
            const res = await request(app)
                .delete(`/participante/66d810000000000000000000/${tournament._id}`)
                .set("Authorization", `${token}`)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Participante not found");
        });
    });
});
 