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
});

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

const createPartidoSchema = z.object({
    fecha: z.date(),
    competition: objectIdSchema,
    equipo1: z.string(),
    equipo2: z.string(),
    golesEquipo1: z.number().optional().default(0),
    golesEquipo2: z.number().optional().default(0),
    status: z.enum(['pending', 'completed', 'canceled']).default('pending'),
});

const updatePartidoSchema = z.object({
    fecha: z.date().optional(),
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

module.exports = {
    registerSchema,
    loginSchema,
    createTournamentSchema,
    editUserSchema,
    updateTournamentSchema,
    createCompetitionSchema,
    editCompetitionSchema,
    createPartidoSchema,
    updatePartidoSchema
};
