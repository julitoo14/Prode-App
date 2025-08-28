const mongoose = require('mongoose');
const { Schema } = mongoose;

const TournamentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    password: {
        type: String,
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed'],
        default: 'pending'
    },
    rules: {
        type: String,
        enum: ['default', 'partial', 'difference'],
        default: 'default'
    }
}, {
    timestamps: true
});

let Tournament;

try {
    Tournament = mongoose.model('Tournament');
} catch (error) {
    Tournament = mongoose.model('Tournament', TournamentSchema, 'tournaments');
}

module.exports = Tournament;