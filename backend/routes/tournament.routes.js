const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { auth } = require('../middlewares/auth');


router.post('/', auth, tournamentController.createTournament);
router.get('/:id', auth, tournamentController.getTournament);
router.put('/:id', auth, tournamentController.updateTournament);
router.delete('/:id', auth, tournamentController.deleteTournament);

module.exports = router;