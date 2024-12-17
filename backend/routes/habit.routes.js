const express = require('express');
//cargar router
const router = express.Router();
// importar controlador
const habitController = require('../controllers/habitController');
//definir ruta
router.post('/add', habitController.addHabit);
router.get('/byUser/:id', habitController.getHabits);
router.get('/one/:id', habitController.one);
router.put('/toggle/:id', habitController.toggleHabit);
router.put('/edit/:id', habitController.editHabit);
router.delete('/delete/:id', habitController.deleteHabit);

//exportar ruta
module.exports = router;