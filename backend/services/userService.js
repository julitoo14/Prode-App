const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const {
    registerSchema,
    loginSchema,
    editUserSchema,
} = require("../helpers/validationSchemas");
const AppError = require("../utils/AppError");

const register = async (params) => {
    try {
        const validatedParams = registerSchema.parse(params);
        const userExists = await User.findOne({ email: validatedParams.email });
        if (userExists) {
            throw new AppError(400, "Email already exists");
        }
        const userExistsByUserName = await User.findOne({
            userName: validatedParams.userName,
        });
        if (userExistsByUserName) {
            throw new AppError(400, "User name already exists");
        }
        const hashedPassword = await bcrypt.hash(validatedParams.password, 10);
        const user = new User({ ...validatedParams, password: hashedPassword });
        await user.save();
        const userCreated = user.toObject();
        delete userCreated.password;
        return userCreated;
    } catch (err) {
        if (err.name === "ZodError") {
            throw new AppError(400, "Validation error", err.errors);
        }
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError(400, "Error creating user");
    }
};

const login = async (params) => {
    try {
        const validatedParams = loginSchema.parse(params);
        const user = await User.findOne({ email: validatedParams.email })
            .select("+password +role")
            .exec();
        if (!user) {
            throw new AppError(404, "User not found");
        }
        const isPasswordValid = await bcrypt.compare(
            validatedParams.password,
            user.password
        );
        if (!isPasswordValid) {
            throw new AppError(400, "Wrong credentials");
        }
        const token = jwt.createToken(user);
        const savedUser = user.toObject();
        delete savedUser.password;
        return { token, user: savedUser };
    } catch (err) {
        if (err.name === "ZodError") {
            throw new AppError(400, "Validation error", err.errors);
        }
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError(400, "Login Error");
    }
};

const getAllUsers = async () => {
    const users = await User.find().select("+password +role").exec();
    const savedUsers = users.map((user) => {
        const savedUser = user.toObject();
        delete savedUser.password;
        delete savedUser.email;
        return savedUser;
    });
    return savedUsers;
};

const getUser = async (id) => {
    const user = await User.findById(id).select("+password +role").exec();
    if (!user) {
        throw new AppError(404, "User not found");
    }
    const savedUser = user.toObject();
    delete savedUser.password;
    return savedUser;
};

const getUserById = async (id) => {
    try {
        const user = await User.findById(id).select("+password +role").exec();
        if (!user) {
            throw new AppError(404, "User not found");
        }
        const savedUser = user.toObject();
        delete savedUser.password;
        delete savedUser.role;
        delete savedUser.email;
        return savedUser;
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError(400, err.message);
    }
};

const editUser = async (id, params) => {
    try {
        const validatedParams = editUserSchema.parse(params);
        const user = await User.findByIdAndUpdate(id, validatedParams, {
            new: true,
        }).exec();
        if (!user) {
            throw new AppError(404, "User not found");
        }
        const savedUser = user.toObject();
        delete savedUser.password;
        return savedUser;
    } catch (err) {
        if (err.name === "ZodError") {
            throw new AppError(400, "Validation error");
        }
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError(400, err.message);
    }
};

const deleteUser = async (id) => {
    const deletedUser = await User.deleteOne({ _id: id });
    if (deletedUser.deletedCount === 0) {
        throw new AppError(404, "User not found");
    }
    return true;
};

module.exports = {
    register,
    login,
    getUser,
    getUserById,
    editUser,
    deleteUser,
    getAllUsers,
};
