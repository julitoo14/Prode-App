//importar dependencias
const express = require('express');
//cargar router
const router = express.Router();
// importar controlador
const userController = require('../controllers/userController');
const {auth} = require('../middlewares/auth');
//definir ruta
router.post('/register', userController.register)
router.post('/login' , userController.login)
router.get('/user/me', auth, userController.getUser)
router.get('/user/:id', userController.getUserById)

//exportar ruta
module.exports = router;