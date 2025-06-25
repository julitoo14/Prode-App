const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 3 && v.length <= 16;
            },
            message: props => `${props.value} debe tener entre 3 y 16 caracteres!`
        }
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} no es un email válido!`
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true
    }
}, {
    timestamps: true
});

let User;

try {
    User = mongoose.model('User');
} catch (error) {
    User = mongoose.model('User', UserSchema, 'users');
}

module.exports = User;