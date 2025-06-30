const request = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany(); // limpia después de cada test
});

describe("POST /auth/register", () => {
    it("crea un nuevo usuario si los datos son válidos", async () => {
        const res = await request(app).post("/auth/register").send({
            userName: "julian123",
            email: "julian@example.com",
            password: "12345678",
        });

        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty("userName", "julian123");
        expect(res.body.user).not.toHaveProperty("password");
    });

    it("falla si el email ya está en uso", async () => {
        await User.create({
            userName: "julian",
            email: "julian@example.com",
            password: "hashedpass",
        });

        const res = await request(app).post("/auth/register").send({
            userName: "otros",
            email: "julian@example.com",
            password: "12345678",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Email already exists/i);
    });

    it("falla si el nombre de usuario ya está en uso", async () => {
        await User.create({
            userName: "julian",
            email: "julian@example.com",
            password: "hashedpass",
        });

        const res = await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@another.com",
            password: "12345678",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/User name already exists/i);
    });

    it("falla si la contraseña es inválida", async () => {
        const res = await request(app).post("/auth/register").send({
            userName: "julian123",
            email: "julian@example.com",
            password: "123",
        });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(
            "String must contain at least 8 character(s)"
        );
    });

    it("falla si el nombre de usuario es inválido", async () => {
        const res = await request(app).post("/auth/register").send({
            userName: "j3",
            email: "julian@example.com",
            password: "12345678",
        });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(
            "String must contain at least 5 character(s)"
        );
    });

    it("deberia loguear un usuario correctamente", async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });
        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("userName", "julian");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.token).toBeDefined();
    });

    it("deberia fallar al loguear un usuario si no existe", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "12345678",
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/User not found/i);
    });

    it("deberia fallar al loguear un usuario con email inválido", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "invalid-email",
            password: "12345678",
        });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch("Invalid email");
    });

    it("deberia fallar al loguear un usuario con contraseña inválida", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123",
        });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(
            "String must contain at least 8 character(s)"
        );
    });

    it("deberia obtener un usuario correctamente", async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app)
            .get(`/auth/user/me`)
            .set("Authorization", `${loginRes.body.token}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("userName", "julian");
        expect(res.body.user).not.toHaveProperty("password");
    });

    it ('deberia fallar al obtener un usuario con un token invalido', async () => {
        const res = await request(app).get(`/auth/user/me`)
        .set("Authorization", `Bearer invalid-token`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Token invalido/i);
    })

    it('deberia obtener un usuario por id correctamente', async () => {
        const registerRes = await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });


        const res = await request(app).get(`/auth/user/${registerRes.body.user._id}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("userName", "julian");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.user).not.toHaveProperty("role");
        expect(res.body.user).not.toHaveProperty("email");
        expect(res.body.user).toHaveProperty("_id");
    })

    it('deberia fallar al obtener un usuario por id invalido', async () => {
        const res = await request(app).get(`/auth/user/dsa31123das`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        expect(res.status).toBe(400);
    })

    it('deberia editar un usuario correctamente', async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app)
        .put(`/auth/user`)
        .set("Authorization", `${loginRes.body.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
            userName: "julian2",
        });
        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("userName", "julian2");
        expect(res.body.user).not.toHaveProperty("password");
    })

    it('deberia fallar al enviar un informacion invalida al editar un usuario', async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app)
        .put(`/auth/user`)
        .set("Authorization", `${loginRes.body.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
            userName: "j",
        });
        expect(res.status).toBe(400);
    })

    it('deberia eliminar un usuario correctamente', async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app)
        .delete(`/auth/user`)
        .set("Authorization", `${loginRes.body.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        expect(res.status).toBe(204);
        expect(await User.findById(loginRes.body.user._id)).toBeNull();
    })

    it('deberia obtener todos los usuarios correctamente', async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });
        await request(app).post("/auth/register").send({
            userName: "julian2",
            email: "julian2@example.com",
            password: "123456789",
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        const res = await request(app).get("/auth/users")
        .set("Authorization", `Bearer ${loginRes.body.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        expect(res.status).toBe(200);
        expect(res.body.users).toHaveLength(2);
        expect(res.body.users[0].userName).toBe("julian");
        expect(res.body.users[1].userName).toBe("julian2");
        expect(res.body.users[0]).not.toHaveProperty("password");
        expect(res.body.users[1]).not.toHaveProperty("password");
        expect(res.body.users[0]).not.toHaveProperty("email");
        expect(res.body.users[1]).not.toHaveProperty("email");
    })

    it('deberia fallar al obtener todos los usuarios sin usuarios registrados', async () => {
        await request(app).post("/auth/register").send({
            userName: "julian",
            email: "julian@example.com",
            password: "123456789",
        });
        
        const loginRes = await request(app).post("/auth/login").send({
            email: "julian@example.com",
            password: "123456789",
        });

        await User.deleteMany();
        
        const res = await request(app).get("/auth/users")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${loginRes.body.token}`)

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No users found/i);
    })

});
