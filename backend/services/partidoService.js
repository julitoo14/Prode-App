const Partido = require('../models/Partido');
const { createPartidoSchema, updatePartidoSchema } = require('../helpers/validationSchemas');
const { ZodError } = require('zod');
const AppError = require('../utils/AppError')


const create = async (params) => {
    try {
        const validatedParams = createPartidoSchema.parse(params);
        const newPartido = await Partido.create(validatedParams);
        return newPartido;
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError(400, 'Invalid partido data', error.errors);
        }
        throw new AppError(500, 'Error creating partido');
    }
}

const getById = async (id) => {
    const partido = await Partido.findById(id);
    if (!partido) {
        throw new AppError(404, 'Partido not found');
    }
    return partido;
}

const getAll = async () => {
    const partidos = await Partido.find();
    return partidos;
}

const update = async (id, params) => {
    try {
        const validatedParams = updatePartidoSchema.parse(params);
        const updatedPartido = await Partido.findByIdAndUpdate(id, validatedParams, { new: true });
        if (!updatedPartido) {
            throw new AppError(404, 'Partido not found');
        }
        return updatedPartido;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        if (error instanceof ZodError) {
            throw new AppError(400, 'Invalid partido data');
        }
        throw new AppError(500, 'Error updating partido');
    }
}

const deletePartido = async (id) => {
    const deletedPartido = await Partido.findByIdAndDelete(id);
    if (!deletedPartido) {
        throw new AppError(404, 'Partido not found');
    }
    return deletedPartido;
}

module.exports = {
    create,
    getById,
    getAll,
    update,
    deletePartido
}