const mongoose = require('mongoose');
const { Schema } = mongoose;

const HistorialSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    completado: {
        type: Boolean,
        required: true
    }
});

const HabitSchema = new Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tipo: {
        type: String,
        enum: ['mal habito', 'buen habito', 'meta'],
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    dias_de_la_semana: {
        type: [String],
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        required: true,
    },
    estado_inicial: {
        type: Boolean,
        default: false
    },
    temporizador: {
        type: Number,
        default: null
    },
    fecha_limite: {
        type: Date,
        default: null
    },
    color: {
        type: String,
        default: '#000000'
    },
    icon: {
        type: String,
        default: '/icons/default.png'
    },
    historial: [HistorialSchema]
});

HabitSchema.pre('save', function(next) {
    if (this.tipo === 'mal habito') {
        this.estado_inicial = true;
    } else {
        this.estado_inicial = false;
    }
    next();
});

let Habit;

try {
    Habit = mongoose.model('Habit');
} catch (error) {
    Habit = mongoose.model('Habit', HabitSchema, 'habits');
}

module.exports = Habit;
