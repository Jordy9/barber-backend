const { response } = require("express");
const { getHorario } = require("../helpers/getHorario");
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

    const { barberId } = req.body

    try {
        let negocio = await Negocio.find({ barberId })

        if ( !negocio ) {
            return res.status(400).json({
                ok: false,
                msg: 'No ha creado un negocio'
            })
        }

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

module.exports = {
    getNegocio,
    crearNegocio,
    actualizarNegocio
}