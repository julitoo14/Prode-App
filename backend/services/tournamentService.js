const Tournament = require("../models/Tournament");
const Competition = require("../models/Competition");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { ZodError } = require("zod");

const {
    createTournamentSchema,
    updateTournamentSchema,
} = require("../helpers/validationSchemas");

const getAll = async () => {
    const tournaments = await Tournament.find({}).exec();

    if (!tournaments || tournaments.length === 0) {
        throw new AppError(404, "No tournaments found");
    }

    const savedTournaments = tournaments.map((tournament) => {
        const savedTournament = tournament.toObject();
        delete savedTournament.password;
        return savedTournament;
    });

    return savedTournaments;
};

const createTournament = async (params) => {
    try {
        const validatedParams = createTournamentSchema.parse(params);

        const tournamentExists = await Tournament.findOne({
            name: validatedParams.name,
        });
        if (tournamentExists) {
            throw new AppError(400, "Tournament already exists");
        }

        const competitionExists = await Competition.findById(
            validatedParams.competition
        );
        if (!competitionExists) {
            throw new AppError(404, "Competition not found");
        }

        const creatorExists = await User.findById(validatedParams.creator);
        if (!creatorExists) {
            throw new AppError(404, "Creator not found");
        }

        const tournament = new Tournament({ ...validatedParams });
        await tournament.save();
        return tournament;
    } catch (error) {
        if (error.name === "ZodError") {
            throw new AppError(400, "Validation error", error.errors);
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(400, "Error creating tournament");
    }
};

const getTournament = async (id) => {
    const tournament = await Tournament.findById(id)
        .populate("competition")
        .populate("creator");
    if (!tournament) {
        throw new AppError(404, "Tournament not found");
    }
    return tournament;
};

const updateTournament = async (id, creatorId, params) => {
    try {
        const validatedParams = updateTournamentSchema.parse(params);
        const tournament = await Tournament.findById(id);
        if (!tournament) {
            throw new AppError(404, "Tournament not found");
        }
        if (tournament.creator.toString() !== creatorId.toString()) {
            throw new AppError(
                400,
                "User is not the creator of the tournament"
            );
        }
        const updatedTournament = await Tournament.findByIdAndUpdate(
            id,
            validatedParams,
            { new: true }
        );
        return updatedTournament;
    } catch (err) {
        if (err instanceof ZodError) {
            throw new AppError(400, "Validation error", err.errors);
        }
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError(400, "Error updating tournament");
    }
};

const deleteTournament = async (id, creatorId) => {
    const tournament = await Tournament.findById(id);
    if (!tournament) {
        throw new AppError(404, "Tournament not found");
    }
    if (tournament.creator.toString() !== creatorId.toString()) {
        throw new AppError(400, "User is not the creator of the tournament");
    }
    return await tournament.deleteOne();
};

module.exports = {
    createTournament,
    getTournament,
    updateTournament,
    deleteTournament,
    getAll,
};
