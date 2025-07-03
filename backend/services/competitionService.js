const Competition = require('../models/Competition');
const AppError = require('../utils/AppError')
const { createCompetitionSchema, editCompetitionSchema } = require('../helpers/validationSchemas')

//POST 
const create = async (params) => {
    try{
        const validatedParams = createCompetitionSchema.parse(params)
        const competitionExist = await Competition.findOne({
            name: validatedParams.name
        })
        if(competitionExist){
            throw new AppError(400, 'Competition Name Already Taken')
        }

        const competition = new Competition(validatedParams);
        await competition.save();
        return competition;
    }catch(err){
        if(err.name === 'ZodError'){
            throw new AppError(400, 'Validation error', err.errors)
        }
        if(err instanceof AppError){
            throw err
        }
    }
}
// GET
const getById = async (id) => {
    const competition = await Competition.findById(id).exec();
    if(!competition){
        throw new AppError(404, 'Competition not found')
    }
    return competition;
}

const getCompetitions = async () => {
    const competitions = await Competition.find({}).exec();
    if(!competitions || competitions.length === 0){
        throw new AppError(404, 'Competitions not found')
    }
    return competitions;
}
// PUT

const editCompetition = async (id, params) => {
    try{
        const validatedParams = editCompetitionSchema.parse(params)
        const competition = await Competition.findById(id).exec();
        if (!competition){
            throw new AppError(404, 'Competition not found');
        }
        const updatedCompetition = await Competition.findByIdAndUpdate(id, validatedParams, {new: true}).exec();
        return updatedCompetition;
    }catch(err){
        if(err.name === 'ZodError'){
            throw new AppError(400, 'Validation error', err.errors);
        }
        if(err instanceof AppError){
            throw err;
        }
    }
}

// DELETE

const deleteCompetition = async (id) => {
    const competition = await Competition.findById(id).exec();
    if(!competition){
        throw new AppError(404, 'Competition not found');
    }
    return await Competition.findByIdAndDelete(id).exec();
}

module.exports = {
    create,
    getCompetitions,
    getById,
    editCompetition,
    deleteCompetition
}