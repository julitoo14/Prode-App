const participanteService  = require('../services/participanteService')

const create = async (req, res) => {
    const { user, tournament } = req.body
    const participante = await participanteService.create(user, tournament)
    res.status(201).json({ 
        participante,
        message: 'Participante created successfully',
        status: 'success'
    })
}

const getAll = async (req, res) => {
    const participantes = await participanteService.getAll()
    res.status(200).json({ 
        participantes,
        message: 'Participantes fetched successfully',
        status: 'success'
    })
}

const getById = async (req, res) => {
    const { id } = req.params
    const participante = await participanteService.getById(id)
    res.status(200).json({ 
        participante,
        message: 'Participante fetched successfully',
        status: 'success'
    })
}

const deleteParticipante = async (req, res) => {
    const { participantId, tournamentId } = req.params
    const userId = req.user._id
    const deletedParticipante = await participanteService.deleteParticipante(participantId, tournamentId, userId)
    res.status(204).json({ 
        deletedParticipante,
        message: 'Participante deleted successfully',
        status: 'success'
    })
}

module.exports = { create, getAll, getById, deleteParticipante }