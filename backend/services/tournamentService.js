const Tournament = require('../models/Tournament');
const Competition = require('../models/Competition');
const User = require('../models/User');
const { createTournamentSchema, updateTournamentSchema } = require('../helpers/validationSchemas');

const getAll = async () => {
    const tournaments = await Tournament.find({}).exec();
    
    if(!tournaments || tournaments.length === 0) {
        throw new Error("No tournaments found")
    }

    const savedTournaments = tournaments.map(tournament => {
        const savedTournament = tournament.toObject();
        delete savedTournament.password;
        return savedTournament;
    });


    return savedTournaments;
}

const createTournament = async(params) => {
    try{
        const validatedParams = createTournamentSchema.parse(params);
        const tournamentExists = await Tournament.findOne({ name: validatedParams.name });
        if(tournamentExists){
            throw new Error("Tournament already exists");
        }
        
        const competitionExists = await Competition.findById(validatedParams.competition);
        if(!competitionExists){
            throw new Error("Competition not found");
        }
        
        const creatorExists = await User.findById(validatedParams.creator);
        if(!creatorExists){
            throw new Error("Creator not found");
        }
        
        const tournament = new Tournament({...validatedParams});
        await tournament.save();
        return tournament;
    } catch (error) {
        throw error;
    }
}

const getTournament = async(id) => {
        const tournament = await Tournament.findById(id).populate('competition').populate('creator');
        if (!tournament) {
            const err = new Error("Tournament not found");
            err.status = 404;
            throw err;
          }
        return tournament;

}

const updateTournament = async(id, creatorId, params) => {
    const validatedParams = updateTournamentSchema.parse(params);
    const tournament = await Tournament.findById(id);
    if(!tournament){
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    if(tournament.creator.toString() !== creatorId.toString()){
        throw new Error("User is not the creator of the tournament");
    }
    const updatedTournament = await Tournament.findByIdAndUpdate(id, validatedParams, { new: true });
    return updatedTournament;
}

const deleteTournament = async(id, creatorId) => {
    const tournament = await Tournament.findById(id);
    if(!tournament){
        throw new Error("Tournament not found");
    }
    if(tournament.creator.toString() !== creatorId.toString()){
        throw new Error("User is not the creator of the tournament");
    }
    await tournament.deleteOne();
}


module.exports = {
    createTournament,
    getTournament,
    updateTournament,
    deleteTournament,
    getAll
}