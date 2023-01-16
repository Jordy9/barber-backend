const{Schema, model} = require('mongoose');

const CitaSchema = Schema({
    userId: {
        type: String,
        required: true
    },
    cita: {
        type: Object,
        required: true,
    },
    ninos: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true
})

module.exports = model('Cita', CitaSchema);