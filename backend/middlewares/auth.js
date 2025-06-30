const jwt = require('jwt-simple');
const moment = require('moment');

//import secret key
const {secret} = require('../helpers/jwt');

//create middleware
exports.auth = (req, res, next) => {
    //check auth header
    if(!req.headers.authorization){
        return res.status(403).send({
            status: 'error',
            message: 'La peticion no tiene la cabecera de autenticacion'
        });
    }

    //cleanup token
    let token = req.headers.authorization.replace(/['"]+/g, '');
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    try{
        //decode token
        let payload = jwt.decode(token, secret);
        //add user data to the request
        req.user = payload;

    }catch(err){

        if(err.message === 'Token expired'){
            return res.status(401).send({
                status: 'error',
                message: 'Token expired'
            });
        }

        return res.status(403).send({
            status: 'error',
            message: 'Token invalido',
            error: err
        });

    }

    //go through
    next();
};