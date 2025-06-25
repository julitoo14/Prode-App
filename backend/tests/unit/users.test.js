const mongoose = require('mongoose');
const { MongoMemoryServer } = require("mongodb-memory-server");
const userService = require('../../services/userService');
const User = require('../../models/User');
let mongoServer;

// Configuración de la base de datos de prueba
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpiar la colección de usuarios antes de cada prueba
beforeEach(async () => {
    await User.deleteMany({});
});

describe('User Service', () => {
    test('debería crear un usuario correctamente', async () => {
        const userData = {
            userName: 'testuser',
            password: 'password123',
            email: 'test@example.com'
        };

        const user = await userService.register(userData);

        expect(user._id).toBeDefined();
        expect(user.userName).toBe(userData.userName);
        expect(user.email).toBe(userData.email);
    });

    test('debería fallar al crear un usuario sin campos requeridos', async () => {
        const userData = {
            userName: 'testuser',
            // Falta email y password
        };
        await expect(userService.register(userData)).rejects.toThrow();
    });

    test('debería fallar al crear un usuario con email ya registrado', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        await userService.register(userData);
        await expect(userService.register(userData)).rejects.toThrow();
    });

    test('debería fallar al crear un usuario con email inválido', async () => {
        const userData = {
            userName: 'testuser',
            email: 'invalid-email',
            password: 'password123'
        };

        await expect(userService.register(userData)).rejects.toThrow();
    });

    test('debería fallar al crear un usuario con contraseña menor a 8 caracteres', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: '123'
        };

        await expect(userService.register(userData)).rejects.toThrow("String must contain at least 8 character(s)");
    });

    test('debería fallar al crear un usuario con contraseña mayor a 16 caracteres', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: '12345678901234567'
        };

        await expect(userService.register(userData)).rejects.toThrow("String must contain at most 16 character(s)");
    });

    test('debería fallar al crear un usuario con nombre de usuario inválido', async () => {
        const userData = {
            userName: '12@@@',
            email: 'test@example.com',
            password: 'password123'
        };

        await expect(userService.register(userData)).rejects.toThrow();
    });

    test('Debería loguear un usuario correctamente', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        await userService.register(userData);
        const { token, user } = await userService.login(userData);
        expect(token).toBeDefined();
        expect(user).toBeDefined();
        expect(user._id).toBeDefined();
        expect(user.userName).toBe(userData.userName);
        expect(user.email).toBe(userData.email);
    });

    test('Debería fallar al loguear un usuario con credenciales incorrectas', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        await userService.register(userData);
        await expect(userService.login({
            email: 'test@example.com',
            password: 'wrongpassword'
        })).rejects.toThrow("Wrong credentials");
    });

    test('Debería fallar al loguear un usuario con email inexistente', async () => {
        await expect(userService.login({
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toThrow("User not found");
    });

    test('Debería fallar al loguear un usuario con email inválido', async () => {
        await expect(userService.login({
            email: 'invalid-email',
            password: 'password123'
        })).rejects.toThrow("Invalid email");
    });

    test('Debería fallar al loguear un usuario con contraseña menor a 8 caracteres', async () => {
        await expect(userService.login({
            email: 'test@example.com',
            password: '123'
        })).rejects.toThrow();
    });

    test('Debería fallar al loguear un usuario con contraseña mayor a 16 caracteres', async () => {
        await expect(userService.login({
            email: 'test@example.com',
            password: '12345678901234567890'
        })).rejects.toThrow();
    });

    test('Debería obtener un usuario correctamente', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        const registeredUser = await userService.register(userData);
        const user = await userService.getUser(registeredUser._id);
        expect(user).toBeDefined();
        expect(user._id).toBeDefined();
        expect(user.userName).toBe(userData.userName);
        expect(user.email).toBe(userData.email);
        expect(user).toHaveProperty('role');
    });

    test('Debería fallar al obtener un usuario inexistente', async () => {
        await expect(userService.getUser(new mongoose.Types.ObjectId('667064000000000000000000'))).rejects.toThrow("User not found");
    });

    test('Debería fallar al obtener un usuario con id inválido', async () => {
        await expect(userService.getUser('123')).rejects.toThrow("Cast to ObjectId failed for value \"123\" (type string) at path \"_id\"");
    });

    test('Debería obtener un usuario por id correctamente', async () => {
        const userData = {
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        const registeredUser = await userService.register(userData);
        const user = await userService.getUserById(registeredUser._id);
        expect(user).toBeDefined();
        expect(user._id).toBeDefined();
        expect(user.userName).toBe(userData.userName);
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('role');
        expect(user).not.toHaveProperty('email'); //no devuelve email
    });

    test('Debería fallar al obtener un usuario por id inexistente', async () => {
        await expect(userService.getUserById(new mongoose.Types.ObjectId('667064000000000000000000'))).rejects.toThrow("User not found");
    });

    test('Debería fallar al obtener un usuario por id con id inválido', async () => {
        await expect(userService.getUserById('123')).rejects.toThrow("Cast to ObjectId failed for value \"123\" (type string) at path \"_id\"");
    });

});
