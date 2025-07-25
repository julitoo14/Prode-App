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
    }
}

const getById = async (id) => {
    const partido = await Partido.findById(id);
    if (!partido) {
        throw new AppError(404, 'Partido not found');
    }
    return partido;
}

const getAll = async (filters = {}) => {
    const query = {};

    if (filters.round) {
        query.round = filters.round;
    }

    if (filters.competition) {
        query.competition = filters.competition;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.fecha) {
        const fecha = new Date(filters.fecha);
        const siguienteDia = new Date(fecha);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        query.fecha = { $gte: fecha, $lt: siguienteDia };
    }

    if (!filters.fecha && filters.half) {
        const year = new Date().getFullYear(); // Podés ajustar esto si querés soportar otros años
        if (filters.half === '1') {
            query.fecha = {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lt: new Date(`${year}-07-01T00:00:00.000Z`)
            };
        } else if (filters.half === '2') {
            query.fecha = {
                $gte: new Date(`${year}-07-01T00:00:00.000Z`),
                $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
            };
        }
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const partidos = await Partido.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ fecha: 1 });

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