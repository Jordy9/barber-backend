const { response } = require("express");
const Negocio = require("../models/Negocio");

const getNegocio = async( req, res = response ) => {
    
    try {
        const negocio = await Negocio.find()

        res.status(200).json({
            ok: true,
            negocio
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const crearNegocio = async( req, res = response ) => {

    const negocio = new Negocio( req.body )

    try {

        const negocioGuardado = await negocio.save()

        res.status(200).json({
            ok: true,
            negocio: negocioGuardado
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const actualizarNegocio = async( req, res = response ) => {
    const negocioId = req.params.id

    try {
        let negocio = await Negocio.findById(negocioId)

        if ( !negocio ) {
            return res.status(400).json({
                ok: false,
                msg: 'No ha creado un negocio'
            })
        }

        const nuevoNegocio = {
            ...req.body
        }

        const negocioActualizado = await Negocio.findByIdAndUpdate(negocioId, nuevoNegocio, { new: true })

        res.status(200).json({
            ok: true,
            negocio: negocioActualizado
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

module.exports = {
    getNegocio,
    crearNegocio,
    actualizarNegocio
}