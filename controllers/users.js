const {response} = require('express');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const {generarJWT} = require('../helpers/jwt');
// const Usuario = require('../models/Usuario');
const {OAuth2Client} = require('google-auth-library');
const moment = require('moment');
const fetch = require('node-fetch')

const googleIdAccount = process.env.googleIdApiAccount

const client = new OAuth2Client(`${googleIdAccount}`)


const obtenerUsers = async(req, res = response) => {
    const users = await User.find().sort('-createdAt')
    res.status(200).json({
        ok: true,
        users,
    })
}

const crearUser = async(req, res = response) => {
    
    const {email, password} = req.body
    try {

        let users = await User.findOne({email});

        if(users) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con este correo'
            })
        }

        users = new User(req.body);

        //Encriptar contrasena

        const salt = bcrypt.genSaltSync();
        users.password = bcrypt.hashSync(password, salt);

        await users.save()

        res.status(201).json({
            ok: true,
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


const updateUsers = async(req, res = response) => {
    const usersId = req.params.id
    const {password} = req.body
    
    try {

        const users = await User.findById(usersId);

        if(!users) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con este id'
            })
        }

        const nuevoUser = {
            ...req.body
        }

        if (users.password !== password) {
            const salt = bcrypt.genSaltSync();
            nuevoUser.password = bcrypt.hashSync(password, salt);
        }

        const usersActualizado = await User.findByIdAndUpdate(usersId, nuevoUser, {new: true})

        res.json({
            ok: true,
            users: usersActualizado
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const deleteUsers = async(req, res = response) => {
    const usersId = req.params.id
    const usuarioActive = req.body
    
    try {

        const users = await User.findById(usersId);

        if(usuarioActive.role !== 'Administrador') {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene el privilegio de eliminar un usuario'
            })
        }

        if(!users) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con este id'
            })
        }

        const usersEliminado = await User.findByIdAndDelete(usersId)

        res.json({
            ok: true,
            users: usersEliminado
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const loginUser = async(req, res = response) => {
    const {email, password} = req.body

    try {
        
        let users = await User.findOne({email});

        if(!users) {
            return res.status(400).json({
                ok: false,
                msg: 'Ha habido un problema, revisa que hayas puesto tu email correctamente'
            })
        }

        //Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, users.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            })
        }

        //Generar JWT

        const token = await generarJWT(users.id, users.name)

        res.json({
            ok: true,
            uid: users.id,
            name: users.name,
            token
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const googleLogin = async (req, res = response) => {

    const {credential} = req.body
    // console.log(req.body)

    const cliente = await client.verifyIdToken({
        idToken: credential, 
        audience: `${googleIdAccount}`,
    })
    
    const { given_name, family_name, email, name, email_verified } = cliente.payload

    if (!email_verified) {
       return res.status(400).json({
        ok: false,
        msg: 'Hubo un problema al iniciar sesión con este usuario1'
       }) 
    }

    try {
        let users = await User.findOne({email});

    // if (!users) {
    //     return res.status(400).json({
    //         ok: false,
    //         msg: 'Hubo un problema al iniciar sesión con este usuario2'
    //     })
    // }

    
    if (!users) {

        let password = `Y@${email} ${name}147852369`

        users = new User({
            name: given_name, 
            lastName: family_name,
            email: email,
            password: password,
        });

        //Encriptar contrasena

        const salt = bcrypt.genSaltSync();
        users.password = bcrypt.hashSync(password, salt);

        await users.save()
    }

    //Generar JWT

    const token = await generarJWT(users.id, users.name)

    res.json({
        ok: true,
        uid: users.id,
        name: users.name,
        token
    })
    } catch (error) {
        console.log(error)
    }
}

const facebookLogin = async (req, res = response) => {

    const {userID, accessToken} = req.body
    

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`

    const resp = await fetch(urlGraphFacebook, {
        method: 'GET',
        mode: 'cors'
        
    })

    const body = await resp.json()

    const { name, email } = body

    const nameSplit = name.split(" ")

    const lastName = name.slice(5)

    if (!email) {
       return res.status(400).json({
        ok: false,
        msg: 'Hubo un problema al iniciar sesión con este usuario1'
       }) 
    }

    try {
        let users = await User.findOne({email});

    // if (!users) {
    //     return res.status(400).json({
    //         ok: false,
    //         msg: 'Hubo un problema al iniciar sesión con este usuario2'
    //     })
    // }

    
    if (!users) {

        let password = `Y@${email} ${name}147852369`

        users = new User({
            name: nameSplit[0], 
            lastName: lastName,
            email: email,
            password: password,
        });

        //Encriptar contrasena

        const salt = bcrypt.genSaltSync();
        users.password = bcrypt.hashSync(password, salt);

        await users.save()
    }

    //Generar JWT

    const token = await generarJWT(users.id, users.name)

    res.json({
        ok: true,
        uid: users.id,
        name: users.name,
        token
    })
    } catch (error) {
        console.log(error)
    }
}

const revalidarTokenUser = async(req, res = response) => {

    const {uid, name} = req

    //Generar JWT

    const token = await generarJWT(uid, name)


    res.json({
        ok: true,
        token,
        uid,
        name
    })
}



module.exports = {
    obtenerUsers,
    crearUser,
    updateUsers,
    deleteUsers,
    loginUser,
    googleLogin,
    facebookLogin,
    revalidarTokenUser
}