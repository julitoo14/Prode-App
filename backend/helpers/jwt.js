const jwt = require('jwt-simple');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

//clave
const secret = process.env.SECRET_JWT;
//crear funcion para generar tokens
const createToken = (user) => {
    const payload = {
        userName: user.userName,
        email: user.email,
        _id: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(1440, "minutes").unix()
    };

    return jwt.encode(payload, secret);
}
//exportar modulos
module.exports = {secret, createToken};