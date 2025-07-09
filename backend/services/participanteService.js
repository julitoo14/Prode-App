const Participante = require('../models/Participante');
const AppError = require('../utils/AppError')
const User = require('../models/User')
const Tournament = require('../models/Tournament')

// POST
const create = async (userId, tournamentId) => {
            // Validamos que el usuario y el torneo existan
        const user = await User.findById(userId)
        if(!user){
            throw new AppError(404, 'User not found')
        }
        const tournament = await Tournament.findById(tournamentId)
        if(!tournament){
            throw new AppError(404, 'Tournament not found')
        }
        //Verificamos que el torneo no tenga un participante con el mismo usuario
        const participanteExist = await Participante.findOne({
            user: user._id,
            tournament: tournament._id
        })
        if(participanteExist){
            throw new AppError(400, 'Participante already enrolled')
        }
        //Creamos el participante
        const participante = new Participante({
            name: user.userName,
            user: user._id,
            tournament: tournament._id
        });
        await participante.save();
        return participante;
}

// GET

const getAll = async () => {
    const participantes = await Participante.find({}).exec();
    return participantes;
}

const getById = async (id) => {
    const participante = await Participante.findById(id).exec();
    if(!participante){
        throw new AppError(404, 'Participante not found')
    }
    return participante;
}

// DELETE

const deleteParticipante = async (participantId, tournamentId, userId) => {
    const participante = await Participante.findOne({
        _id: participantId,
        tournament: tournamentId,
        user: userId
    }).exec();
    if(!participante){
        throw new AppError(404, 'Participante not found')
    }
    await participante.deleteOne();
    return true;
}

module.exports = {
    create,
    getAll,
    getById,
    deleteParticipante
}

