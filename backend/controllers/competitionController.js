const competitionService = require('../services/competitionService');

const createCompetition = async (req, res) => {
    const params = req.body;
    const competition = await competitionService.create(params);
    res.status(201).json({
        status: 'success',
        message: 'Competition created successfully',
        competition
    });
};

const getAllCompetitions = async (req, res) => {
    const competitions = await competitionService.getCompetitions();
    res.status(200).json({
        status: 'success',
        message: 'Competitions fetched successfully',
        competitions
    });
};

const getCompetitionById = async (req, res) => {
    const { id } = req.params;
    const competition = await competitionService.getById(id);
    res.status(200).json({
        status: 'success',
        message: 'Competition fetched successfully',
        competition
    });
};

const updateCompetition = async (req, res) => {
    const { id } = req.params;
    const params = req.body;
    const competition = await competitionService.editCompetition(id, params);
    res.status(200).json({
        status: 'success',
        message: 'Competition updated successfully',
        competition
    });
};

const deleteCompetition = async (req, res) => {
    const { id } = req.params;
    await competitionService.deleteCompetition(id);
    res.status(204).json({
        status: 'success',
        message: 'Competition deleted successfully'
    });
};

module.exports = {
    createCompetition,
    getAllCompetitions,
    getCompetitionById,
    updateCompetition,
    deleteCompetition
};