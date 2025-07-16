const Prediction = require('../models/Prediction');
const Participante = require('../models/Participante');
const Partido = require('../models/Partido');
const AppError = require('../utils/AppError');
const { ZodError } = require('zod');
const { createPredictionSchema, updatePredictionSchema} = require('../helpers/validationSchemas');

const create = async (params) => {
    try{
        const validatedParams = createPredictionSchema.parse(params);
        const prediction = new Prediction(validatedParams);
        const existingPrediction = await Prediction.findOne({
            participante: prediction.participante,
            partido: prediction.partido
        });
        if (existingPrediction) {
            throw new AppError(400, 'Prediction already exists for this match and participant');
        }

        const participante = await Participante.findById(prediction.participante);
        if (!participante) {
            throw new AppError(404, 'Participante not found');
        }
        const partido = await Partido.findById(prediction.partido);
        if (!partido) {
            throw new AppError(404, 'Partido not found');
        }

        const now = new Date();
        const matchDate = new Date(partido.fecha);
        const diff = matchDate - now;
        if (diff < 10 * 60 * 1000) {
            throw new AppError(400, 'Prediction cannot be created less than 10 minutes before the match');
        }

        const savedPrediction = await prediction.save();
        return savedPrediction;
    }catch(e){
        if(e instanceof ZodError){
            throw new AppError(400, 'Invalid prediction data', e.errors);
        }
        if(e instanceof AppError){
            throw e;
        }
    }
}

const get = async (id) => {
    const prediction = await Prediction.findById(id).exec();
    if (!prediction) {
        throw new AppError(404, 'Prediction not found');
    }
    return prediction;
}

const getByParticipante = async (id) => {
    const predictions = await Prediction.find({participante: id}).exec();
    return predictions;
}

const getByPartido = async (partidoId) => {
    const predictions = await Prediction.find({partido: partidoId}).exec();
    return predictions;
}

const update = async (id, params) => {
    try{
        const validatedParams = updatePredictionSchema.parse(params);
        const prediction = await Prediction.findById(id).exec();
        if (!prediction) {
            throw new AppError(404, 'Prediction not found');
        }

        const partido = await Partido.findById(prediction.partido);
        if (!partido) {
            throw new AppError(404, 'Partido not found');
        }

        const now = new Date();
        const matchDate = new Date(partido.fecha);
        const diff = matchDate - now;
        if (diff < 10 * 60 * 1000) {
            throw new AppError(400, 'Prediction cannot be updated less than 10 minutes before the match');
        }

        const updatedPrediction = await Prediction.findByIdAndUpdate(id, validatedParams, { new: true }).exec();
        return updatedPrediction;
    }catch(e){
        if(e instanceof ZodError){
            throw new AppError(400, 'Invalid prediction data', e.errors);
        }
        if(e instanceof AppError){
            throw e;
        }
    }
}

const deletePrediction = async (id) => {
    const prediction = await Prediction.findByIdAndDelete(id).exec();
    if (!prediction) {
        throw new AppError(404, 'Prediction not found');
    }
    return prediction;
}

module.exports = {
    create,
    get,
    getByParticipante,
    getByPartido,
    update,
    deletePrediction
}