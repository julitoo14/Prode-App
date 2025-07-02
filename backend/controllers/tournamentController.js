const tournamentService = require("../services/tournamentService");

const createTournament = async (req, res) => {
    let params = req.body;
    const tournament = await tournamentService.createTournament(params);
    return res.status(201).send({
        status: "success",
        message: "Tournament created successfully",
        tournament,
    });
};

const getTournament = async (req, res) => {
    const tournament = await tournamentService.getTournament(req.params.id);
    return res.status(200).send({
        status: "success",
        message: "Tournament retrieved successfully",
        tournament,
    });
};

const getAll = async (req, res) => {
    const tournaments = await tournamentService.getAll();
    return res.status(200).send({
        status: "success",
        message: "Tournaments retrieved succesfully",
        tournaments,
    });
};

const updateTournament = async (req, res) => {
    let params = req.body;
    const tournament = await tournamentService.updateTournament(
        req.params.id,
        req.user._id,
        params
    );
    return res.status(200).send({
        status: "success",
        message: "Tournament updated successfully",
        tournament,
    });
};

const deleteTournament = async (req, res) => {
    await tournamentService.deleteTournament(req.params.id, req.user._id);
    return res.status(204).send();
};

module.exports = {
    createTournament,
    getTournament,
    updateTournament,
    deleteTournament,
    getAll,
};
