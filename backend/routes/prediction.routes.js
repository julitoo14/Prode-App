const express = require('express');
const router = express.Router();
const predictionService = require('../services/predictionService');
const { auth } = require('../middlewares/auth');
const AppError = require('../utils/AppError');

// Crear una nueva predicción
router.post('/', auth, async (req, res, next) => {
    try {
        const prediction = await predictionService.create(req.body);
        res.status(201).json({
            success: true,
            data: {
                prediction
            }
        });
    } catch (error) {
        next(error);
    }
});

// Crear o actualizar múltiples predicciones
router.post('/batch', auth, async (req, res, next) => {
    try {
        const results = await predictionService.upsertBatch(req.body.predictions);
        res.status(200).json({
            success: true,
            data: {
                results
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener predicciones por participante
router.get('/byParticipante/:participanteId', auth, async (req, res, next) => {
    try {
        const predictions = await predictionService.getByParticipante(req.params.participanteId);
        res.status(200).json({
            success: true,
            data: {
                predictions
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener predicciones por partido
router.get('/byPartido/:partidoId', auth, async (req, res, next) => {
    try {
        const predictions = await predictionService.getByPartido(req.params.partidoId);
        res.status(200).json({
            success: true,
            data: {
                predictions
            }
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar una predicción
router.put('/:id', auth, async (req, res, next) => {
    try {
        const prediction = await predictionService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: {
                prediction
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener predicción específica
router.get('/:id', auth, async (req, res, next) => {
    try {
        const prediction = await predictionService.get(req.params.id);
        res.status(200).json({
            success: true,
            data: {
                prediction
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
