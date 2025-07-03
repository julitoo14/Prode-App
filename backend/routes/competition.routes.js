const express = require('express');
const router = express.Router();

const competitionController = require('../controllers/competitionController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, competitionController.createCompetition);
router.get('/all', auth, competitionController.getAllCompetitions);
router.get('/:id', auth, competitionController.getCompetitionById);
router.put('/:id', auth, competitionController.updateCompetition);
router.delete('/:id', auth, competitionController.deleteCompetition);

module.exports = router;