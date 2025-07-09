const mongoose = require('mongoose')

const partidoSchema = new mongoose.Schema({
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    equipo1: {
        type: String,
        required: true
    },
    equipo2: {
        type: String,
        required: true
    },
    golesEquipo1: {
        type: Number,
        required: true
    },
    golesEquipo2: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

const Partido = mongoose.model('Partido', partidoSchema);

module.exports = Partido;