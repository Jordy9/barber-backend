const{Schema, model} = require('mongoose');


const resetPasswordSchema = Schema({
    userId: {
        type: String,
        required: true
    },
    reset: {
        type: String
    },
    createAt: {
        type: Date
    },
    expireAt: {
        type: Date    },
})

module.exports = model('resetPassword', resetPasswordSchema);