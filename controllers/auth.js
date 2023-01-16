const {response} = require('express');
const bcrypt = require('bcryptjs');
const {generarJWT} = require('../helpers/jwt');
const Usuario = require('../models/Usuario');
const { findById } = require('../models/Usuario');

// const obtenerUsuarios = async(req, res = response) => {

//     let {page, size} = req.query

//     if (!page) {
//         page = 1
//     }

//     if (!size) {
//         size = 10
//     }

//     const limit = parseInt(size)
//     const skip = (page - 1) * size

//     Usuario.find().sort('createdAt').limit(limit).skip(skip).exec((err, users) => {
//         Usuario.count((err, count) => {
//             if (err) return false
//             res.status(200).json({
//                 ok: true,
//                 users,
//                 page,
//                 total: Math.ceil(count/limit),
//             })
//         })
//     })    
// }

const obtenerUsuarios = async(req, res = response) => {

    const usuario = await Usuario.find()

    res.status(200).json({
        ok: true,
        usuario,
    })
}

const obtenerUsuarioPorId = async(req, res = response) => {

    const { uid } = req

    const usuario = await Usuario.findById(uid)

    if ( !usuario ) {
        return res.status(400).json({
            ok: false,
            msg: 'Hubo un error con este usuario'
        })
    }

    res.status(200).json({
        ok: true,
        usuario,
    })

}

const crearUsuario = async( req, res = response ) => {
    
    const { email, password } = req.body

    try {

        let usuario = await Usuario.findOne({email});

        if( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con este correo'
            })
        }

        usuario = new Usuario(req.body);

        //Encriptar contrasena

        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save()

        res.status(201).json({
            ok: true,
            usuario,
            msg: 'Usuario Creado exitosamente'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}


const updateUser = async(req, res = response) => {
    const usuarioId = req.params.id
    const {password} = req.body
    
    try {

        const usuario = await Usuario.findById(usuarioId);

        const user = await Usuario.findById(req.body.activeUser.id);

        if(user?.role === 'Administrador') {
            if(!usuario) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe un usuario con este id'
                })
            }
    
            const nuevoUsuario = {
                ...req.body,
            }
    
            if (usuario.password !== password) {
                const salt = bcrypt.genSaltSync();
                nuevoUsuario.password = bcrypt.hashSync(password, salt);
            }
            
            const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, nuevoUsuario, {new: true})
            
            res.json({
                ok: true,
                usuario: usuarioActualizado
            })
        } else {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene el privilegio de actualizar un usuario'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const updateUserProfile = async(req, res = response) => {
    const usuarioId = req.params.id
    const {password} = req.body
    
    try {

        const usuario = await Usuario.findById(usuarioId);

        if(!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con este id'
            })
        }

        const nuevoUsuario = {
            ...req.body,
        }

        if (usuario.password !== password) {
            const salt = bcrypt.genSaltSync();
            nuevoUsuario.password = bcrypt.hashSync(password, salt);
        }
        
        const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, nuevoUsuario, {new: true})
        
        res.json({
            ok: true,
            usuario: usuarioActualizado
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const deleteUser = async(req, res = response) => {
    const usuarioId = req.params.id
    
    try {

        const usuario = await Usuario.findById(usuarioId);

        const user = await Usuario.findById(req.body.id);

        if(user?.role === 'Administrador') {
            if(!usuario) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe un usuario con este id'
                })
            }
    
            const usuarioAEliminado = await Usuario.findByIdAndDelete(usuarioId)
    
            res.json({
                ok: true,
                usuario: usuarioAEliminado
            })
        } else {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene el privilegio de eliminar un usuario'
            })
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const loginUsuario = async(req, res = response) => {
    const {email, password} = req.body

    try {
        
        let usuario = await Usuario.findOne({email});

        if(!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Hubo un error con este email'
            })
        }

        //Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, usuario.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Hubo un error con tu email o contraseña'
            })
        }

        //Generar JWT

        const token = await generarJWT(usuario.id, usuario.name)

        res.json({
            ok: true,
            usuario,
            token
        })


    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const revalidarToken = async(req, res = response) => {

    const { uid, name } = req

    //Generar JWT

    const token = await generarJWT(uid, name)

    const usuario = await Usuario.findById(uid)

    res.json({
        ok: true,
        token,
        usuario
    })
}



module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    updateUser,
    deleteUser,
    loginUsuario,
    revalidarToken
}