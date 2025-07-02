const userService = require("../services/userService");

const register = async (req, res) => {
    let params = req.body;
    const user = await userService.register(params);
    return res.status(201).send({
        status: "success",
        message: "User registered successfully",
        user,
    });
};

const login = async (req, res) => {
    const params = req.body;
    const { token, user } = await userService.login(params);
    return res.status(200).send({
        status: "success",
        message: "User logged successfully",
        token,
        user,
    });
};

const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    return res.status(200).send({
        status: "success",
        users,
    });
};

const getUser = async (req, res) => {
    const user = await userService.getUser(req.user._id);
    return res.status(200).send({
        status: "success",
        user,
    });
};

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).send({
        status: "success",
        user,
    });
};

const editUser = async (req, res) => {
    const user = await userService.editUser(req.user._id, req.body);
    return res.status(200).send({
        status: "success",
        message: "User updated successfully",
        user,
    });
};

const deleteUser = async (req, res) => {
    await userService.deleteUser(req.user._id);
    return res.status(204).send({
        status: "success",
        message: "User deleted successfully",
    });
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUser,
    getUserById,
    editUser,
    deleteUser,
};
