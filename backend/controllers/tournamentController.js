const tournamentService = require('../services/tournamentService');

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

module.exports = {
    createTournament
}