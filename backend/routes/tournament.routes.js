const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { auth } = require('../middlewares/auth');


router.post('/', auth, tournamentController.createTournament);
router.get('/:id', auth, tournamentController.getTournament);
router.put('/:id', auth, tournamentController.updateTournament);

module.exports = router;