const {response} = require('express');
const jwt = require('jsonwebtoken');


const validarJWTReset = (req, res = response, next) => {
    //x-token headers
    const token = req.header('token-user');

    if(!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }
try {
    const {uid, name} = jwt.verify(
        token,
        process.env.SECRET_JWT_SEED_Reset
    )

    req.uid = uid;
    req.name = name

    
} catch (error) {
    return res.status(401).json({
        ok: false,
        msg: 'Token no válido'
    });
}

    next();
}


module.exports = {
    validarJWTReset
}