const partidoService = require('../services/partidoService');

const create = async(req, res) => {
    let params = req.body;
    const partido = await partidoService.create(params);
    return res.status(201).json({
        status: 'success',
        message: 'Partido created successfully',
        partido
    });
}

const getPartido = async(req, res) => {
    const partido = await partidoService.getById(req.params.id);
    return res.status(200).json({
        status: 'success',
        message: 'Partido retrieved successfully',
        partido
    });
}

const getAll = async(req, res) => {
    const partidos = await partidoService.getAll();
    return res.status(200).json({
        status: 'success',
        message: 'Partidos retrieved successfully',
        partidos
    });
}

const updatePartido = async(req, res) => {
    let params = req.body;
    const partido = await partidoService.update(req.params.id, params);
    return res.status(200).json({
        status: 'success',
        message: 'Partido updated successfully',
        partido
    });
}

const deletePartido = async(req, res) => {
    await partidoService.deletePartido(req.params.id);
    return res.status(204).send();
}

module.exports = {
    create,
    getPartido,
    getAll,
    updatePartido,
    deletePartido
}