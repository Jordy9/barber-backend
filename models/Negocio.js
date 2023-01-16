const{Schema, model} = require('mongoose');

const NegocioSchema = Schema({
    barberId: {
        type: String,
        required: true
    },
    servicios: {
        type: Object,
        required: true,
    },
    ubicacion: {
        type: Object,
        required: true,
    },
    horas: {
        type: Object,
        default: { desde: '8:00', hasta: '18:00' },
        required: true,
    },
    horasClientes: {
        type: Object,
        required: true,
    },
    horarioDia: {
        type: Object,
    },
    xTiempo: {
        type: Object,
        default: { cantidad: 30, tiempo: 'Minutos' }
    }
}, {
    timestamps: true
})

module.exports = model('Negocio', NegocioSchema);