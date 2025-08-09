const { Router } = require('express')
const participanteController = require('../controllers/participanteController')
const { auth } = require('../middlewares/auth')

const router = Router()

router.post('/', auth, participanteController.create)
router.get('/all', auth, participanteController.getAll)
router.get('/byUser', auth, participanteController.getByUser)
router.get('/:id', auth, participanteController.getById)
router.delete('/:participantId/:tournamentId', auth, participanteController.deleteParticipante)

module.exports = router