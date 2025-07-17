const mongoose = require('mongoose')

const partidoSchema = new mongoose.Schema({
    externalId: {
        type: String,
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    estadio: {
        type: String,
        required: true,
        default: 'Estadio Principal'
    },
    round: {
        type: Number,
    },
    equipo1Image: {
        type: String,
        default: ''
    },
    equipo2Image: {
        type: String,
        default: ''
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
        default: 'pending'
    },
    videoUrl: {
        type: String,
        default: ''
    },
    bannerUrl: {
        type: String,
        default: ''
    }
})

const Partido = mongoose.model('Partido', partidoSchema);

module.exports = Partido;