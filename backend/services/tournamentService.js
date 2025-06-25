const Tournament = require('../models/Tournament');
const Competition = require('../models/Competition');
const User = require('../models/User');
const { createTournamentSchema } = require('../helpers/validationSchemas');

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

module.exports = {
    createTournament
}