const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const { registerSchema, loginSchema, editUserSchema } = require("../helpers/validationSchemas");

const register = async (params) => {
    const validatedParams = registerSchema.parse(params);
    const userExists = await User.findOne({ email: validatedParams.email });
    if (userExists) {
        throw new Error("Email already exists");
    }
    const userExistsByUserName = await User.findOne({ userName: validatedParams.userName });
    if (userExistsByUserName) {
        throw new Error("User name already exists");
    }
    const hashedPassword = await bcrypt.hash(validatedParams.password, 10);
    const user = new User({...validatedParams, password: hashedPassword});
    await user.save();
    const userCreated = user.toObject();
    delete userCreated.password;
    return userCreated;
}

const login = async (params) => {
    const validatedParams = loginSchema.parse(params);
    const user = await User.findOne({ email: validatedParams.email }).select("+password +role").exec();
    if (!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(validatedParams.password, user.password);
    if (!isPasswordValid) {
        throw new Error("Wrong credentials");
    }
    const token = jwt.createToken(user);
    const savedUser = user.toObject();
    delete savedUser.password;
    return { token, user: savedUser };
}

const getAllUsers = async () => {
    const users = await User.find().select("+password +role").exec();
    if (!users) {
        throw new Error("No users found");
    }
    const savedUsers = users.map(user => {
        const savedUser = user.toObject();
        delete savedUser.password;
        delete savedUser.email;
        return savedUser;
    });
    return savedUsers;
}

const getUser = async (id) => {
    const user = await User.findById(id).select("+password +role").exec();
    if (!user) {
        throw new Error("User not found");
    }
    const savedUser = user.toObject();
    delete savedUser.password;
    return savedUser;
}


const getUserById = async (id) => {
    const user = await User.findById(id).select("+password +role").exec();
    if (!user) {
        throw new Error("User not found");
    }
    const savedUser = user.toObject();
    delete savedUser.password;
    delete savedUser.role;
    delete savedUser.email;
    return savedUser;
}

const editUser = async (id, params) => {
    const validatedParams = editUserSchema.parse(params);
    const user = await User.findByIdAndUpdate(id, validatedParams, { new: true }).exec();
    if (!user) {
        throw new Error("User not found");
    }
    const savedUser = user.toObject();
    delete savedUser.password;
    return savedUser;
}


 const deleteUser = async (id) => {
    const deletedUser = await User.deleteOne({_id: id});
    if(deletedUser.deletedCount === 0) {
        throw new Error("User not found");
    }
    return true;
 }

module.exports = {
    register,
    login,
    getUser,
    getUserById,
    editUser,
    deleteUser,
    getAllUsers
}