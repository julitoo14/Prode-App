const tournamentService = require('../services/tournamentService');
const { ZodError } = require('zod');

const createTournament = async(req, res) => {
    let params = req.body;
    try {
        const tournament = await tournamentService.createTournament(params);
        return res.status(201).send({
            status: "success",
            message: "Tournament created successfully",
            tournament,
        });
    } catch (error) {
        if(error.name === "ZodError"){
            return res.status(400).send({
                status: "error",
                message: "Validation error",
                errors: error.errors,
            });
        }
        
        return res.status(400).send({
            status: "error",
            message: "Error creating tournament",
            error: error.message,
        });
    }
}

const getTournament = async(req, res) => {

    try {
        const tournament = await tournamentService.getTournament(req.params.id);
        return res.status(200).send({
            status: "success",
            message: "Tournament retrieved successfully",
            tournament,
        });
    } catch (error) {
        const status = error.status || 400;
        return res.status(status).send({
            status: "error",
            message: error.message,
        });
    }
}

const updateTournament = async(req, res) => {
    let params = req.body;
    try{
        const tournament = await tournamentService.updateTournament(req.params.id, req.user._id, params);
        return res.status(200).send({
            status: "success",
            message: "Tournament updated successfully",
            tournament,
        });
    } catch (error) {
        if(error instanceof ZodError){
            return res.status(400).send({
                status: "error",
                message: "Validation error",
                errors: error.errors,
            });
        }
        const status = error.status || 400;
        return res.status(status).send({
            status: "error",
            message: error.message,
        });
    }
}

const deleteTournament = async (req, res) => {
    try{
        await tournamentService.deleteTournament(req.params.id, req.user._id);
        return res.status(204).send();
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: error.message,
        });
    }
}


module.exports = {
    createTournament,
    getTournament,
    updateTournament,
    deleteTournament
}