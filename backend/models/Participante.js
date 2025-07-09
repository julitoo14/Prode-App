const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParticipanteSchema = new Schema({
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    points: { type: Number, default: 0 },
    exactPredictions: { type: Number, default: 0 },
    partialPredictions: { type: Number, default: 0 }
});

module.exports = mongoose.model('Participante', ParticipanteSchema, 'participantes');