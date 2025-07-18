const mongoose = require('mongoose');
const { Schema } = mongoose;

const CompetitionSchema = new Schema({
    externalId: { type: String },
    name: { type: String},
    format: { type: String, default: 'cup' },
    image: {type: String, default: null},
    image2: {type: String, default: null},
}, { timestamps: true });

module.exports = mongoose.model('Competition', CompetitionSchema, 'competitions');
