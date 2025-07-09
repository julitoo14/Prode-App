const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, partidoController.create);
router.get('/all', auth, partidoController.getAll);
router.get('/:id', auth, partidoController.getPartido);
router.put('/:id', auth, partidoController.updatePartido);
router.delete('/:id', auth, partidoController.deletePartido);

module.exports = router;