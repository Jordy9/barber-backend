const{Schema, model} = require('mongoose');

const RatingSchema = Schema({
    usuarioId: {
        type: String,
        required: true
    },
    barberId: {
        type: String,
        required: true,
    },
    calificacion: {
        type: Number,
        required: true,
    },
    comentario: {
        type: String
    },
}, {
    timestamps: true
})

module.exports = model('Rating', RatingSchema);