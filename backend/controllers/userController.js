const userService = require("../services/userService");

const register = async (req, res) => { //registro de usuario
    let params = req.body;
    try {
        const user = await userService.register(params);
        return res.status(201).send({
            status: "success",
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        if(error.name === "ZodError"){
            return res.status(400).send({
                status: "error",
                message: "Validation error",
                errors: error.errors,
            });
        }

        return res.status(400).send({
            status: "error",
            message: error.message,
        });
    }
}

const login = async (req, res) => { //login de usuario
    const params = req.body;
    try {
        const { token, user } = await userService.login(params);
        return res.status(200).send({
            status: "success",
            message: "User logged successfully",
            token,
            user,
        });
    } catch (error) {
        if(error.name === "ZodError"){
            return res.status(400).send({
                status: "error",
                message: "Validation error",
                errors: error.errors,
            });
        }

        return res.status(400).send({
            status: "error",
            message: error.message,
        });
    }
}

const getUser = async (req, res) => { //obtener usuario autenticado
    try{
        const user = await userService.getUser(req.user._id);
        return res.status(200).send({
            status: "success",
            user,
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: error.message,
        });
    }
}

const getUserById = async (req, res) => { //obtener usuario por id (publico, no devuelve email, password ni rol)
    try{
        const user = await userService.getUserById(req.params.id);
        return res.status(200).send({
            status: "success",
            user,
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: error.message,
        });
    }
}





module.exports = {
    register,
    login,
    getUser,
    getUserById,
};