const mongoose = require('mongoose');
const { Schema } = mongoose;

const predictionSchema = new Schema({
    partido: {
        type: Schema.Types.ObjectId,
        ref: 'Partido',
        required: true
    },
    participante: {
        type: Schema.Types.ObjectId,
        ref: 'Participante',
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
        enum: ['pending', 'correct', 'incorrect'],
        default: 'pending'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Prediction', predictionSchema, 'predictions');