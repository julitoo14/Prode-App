const { z } = require('zod');
const mongoose = require('mongoose');

const registerSchema = z.object({
    userName: z.string().min(5).max(16).regex(/^[a-zA-Z0-9]+$/),
    password: z.string().min(8).max(16),
    email: z.string().email().toLowerCase()
});

const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(16)
});

const objectIdSchema = z.union([
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId string format'
    }).transform((val) => new mongoose.Types.ObjectId(val)),
    z.instanceof(mongoose.Types.ObjectId)
]);

const editUserSchema = z.object({
    userName: z.string().min(5).max(16).regex(/^[a-zA-Z0-9]+$/)
});

const createTournamentSchema = z.object({
    name: z.string().min(6).max(20),
    competition: objectIdSchema,
    creator: objectIdSchema,
    password: z.string().min(4).max(16),
    status: z.enum(['pending', 'active', 'completed']).default('pending'),
    rules: z.enum(['default', 'partial', 'difference']).default('default'),
})

const updateTournamentSchema = z.object({
    name: z.string().min(6).max(20).optional(),
    status: z.enum(['pending', 'active', 'completed']).optional(),
    rules: z.enum(['default', 'partial', 'difference']).optional(),
    password: z.string().min(4).max(16).optional(),
});

module.exports = { registerSchema, loginSchema, createTournamentSchema, editUserSchema, updateTournamentSchema };