const mongoose = require('mongoose');
const { Schema } = mongoose;

const CompetitionSchema = new Schema({
    name: { type: String, required: true, unique: true },
    format: {type: String, default: "cup"},
    image: {type: String, default: null}
}, { timestamps: true });

module.exports = mongoose.model('Competition', CompetitionSchema, 'competitions');
