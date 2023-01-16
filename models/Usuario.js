const{Schema, model} = require('mongoose');


const UsuarioSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    urlImage: {
        type: String,
    },
    formCita: {
        type: Object,
        default: []
    }
}, {
    timestamps: true
})

module.exports = model('Usuario', UsuarioSchema);