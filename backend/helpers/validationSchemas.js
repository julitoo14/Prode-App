const { z } = require("zod");
const mongoose = require("mongoose");
const { format } = require("path");

const registerSchema = z.object({
    userName: z
        .string()
        .min(5)
        .max(16)
        .regex(/^[a-zA-Z0-9]+$/),
    password: z.string().min(8).max(16),
    email: z.string().email().toLowerCase(),
});

const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(16),
});

const objectIdSchema = z.union([
    z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectId string format",
        })
        .transform((val) => new mongoose.Types.ObjectId(val)),
    z.instanceof(mongoose.Types.ObjectId),
]);

const editUserSchema = z.object({
    userName: z
        .string()
        .min(5)
        .max(16)
        .regex(/^[a-zA-Z0-9]+$/),
});

const createTournamentSchema = z.object({
    name: z.string().min(6).max(20),
    competition: objectIdSchema,
    creator: objectIdSchema,
    password: z.string().min(4).max(16),
    status: z.enum(["pending", "active", "completed"]).default("pending"),
    rules: z.enum(["default", "partial", "difference"]).default("default"),
});

const updateTournamentSchema = z.object({
    name: z.string().min(6).max(20).optional(),
    status: z.enum(["pending", "active", "completed"]).optional(),
    rules: z.enum(["default", "partial", "difference"]).optional(),
    password: z.string().min(4).max(16).optional(),
}).refine((data) => {
    return (
        data.name !== undefined ||
        data.status !== undefined ||
        data.rules !== undefined ||
        data.password !== undefined
    );
},
    { message: 'Debes proporcionar al menos uno de: name, status, rules, password'}
);

const createCompetitionSchema = z.object({
    name: z.string().min(5).max(25),
    format: z.string().optional(),
    image: z.string().optional(),
});

const editCompetitionSchema = z
    .object({
        name: z.string().min(5).max(25).optional(),
        format: z.string().optional(),
        image: z.string().optional(),
    })
    .refine(
        (data) => {
            return (
                data.name !== undefined ||
                data.format !== undefined ||
                data.Image !== undefined
            );
        },
        {
            message:
                "Debes proporcionar al menos uno de: name, format, o Image",
        }
    );

const dateStringToDate = z.string().datetime().transform((val) => new Date(val));
const fechaSchema = z.union([z.date(), dateStringToDate]);

const createPartidoSchema = z.object({
    externalId: z.string().optional(), // Si lo generás desde la API externa
    competition: objectIdSchema,
    fecha: fechaSchema,
    estadio: z.string().min(1).default("Estadio Principal"),
    round: z.number().int().min(1).optional(),
    equipo1: z.string().min(1),
    equipo2: z.string().min(1),
    equipo1Image: z.string().optional().default(""),
    equipo2Image: z.string().optional().default(""),
    golesEquipo1: z.number().int().min(0).default(0),
    golesEquipo2: z.number().int().min(0).default(0),
    status: z.string().default('Match not started'),
    videoUrl: z.string().optional().default(""),
    bannerUrl: z.string().optional().default(""),
});

const updatePartidoSchema = z.object({
    fecha: fechaSchema.optional(),
    competition: objectIdSchema.optional(),
    equipo1: z.string().optional(),
    equipo2: z.string().optional(),
    golesEquipo1: z.number().optional(),
    golesEquipo2: z.number().optional(),
    status: z.enum(['pending', 'finished', 'canceled']).optional(),
}).refine((data) => {
    return (
        data.fecha !== undefined ||
        data.competition !== undefined ||
        data.equipo1 !== undefined ||
        data.equipo2 !== undefined ||
        data.golesEquipo1 !== undefined ||
        data.golesEquipo2 !== undefined ||
        data.status !== undefined
    );
}, { message: 'Debes proporcionar al menos uno de: fecha, competition, equipo1, equipo2, golesEquipo1, golesEquipo2, status' });

const createPredictionSchema = z.object({
    partido: objectIdSchema,
    participante: objectIdSchema,
    golesEquipo1: z.number().int().min(0),
    golesEquipo2: z.number().int().min(0),
    status: z.enum(['pending', 'correct', 'incorrect']).default('pending'),
});

const updatePredictionSchema = z.object({
    golesEquipo1: z.number().int().min(0).optional(),
    golesEquipo2: z.number().int().min(0).optional(),
}).refine((data) => {
    return (
        data.golesEquipo1 !== undefined ||
        data.golesEquipo2 !== undefined
    );
}, { message: 'Debes proporcionar al menos uno de: golesEquipo1, golesEquipo2, status'
});

module.exports = {
    registerSchema,
    loginSchema,
    createTournamentSchema,
    editUserSchema,
    updateTournamentSchema,
    createCompetitionSchema,
    editCompetitionSchema,
    createPartidoSchema,
    updatePartidoSchema,
    createPredictionSchema,
    updatePredictionSchema,
};
