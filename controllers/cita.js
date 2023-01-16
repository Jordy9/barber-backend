const { response } = require("express");
const Cita = require("../models/Cita");

const getCita = async( req, res = response ) => {
    
    try {
        const cita = await Cita.find()

        res.status(200).json({
            ok: true,
            cita
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const crearCita = async( req, res = response ) => {

    const cita = new Cita( req.body )

    try {

        const citaGuardada = await cita.save()

        res.status(201).json({
            ok: true,
            cita: citaGuardada
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const actualizarCita = async( req, res = response ) => {

    const citaId = req.params.id

    try {
        let cita = await Cita.findById(citaId)

        if ( !cita ) {
            return res.status(400).json({
                ok: false,
                msg: 'No ha creado esta cita'
            })
        }

        const nuevaCita = {
            ...req.body
        }

        const citaGuardada = await Cita.findByIdAndUpdate(citaId, nuevaCita, { new: true })

        res.status(200).json({
            ok: true,
            cita: citaGuardada
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

module.exports = {
    getCita,
    crearCita,
    actualizarCita
}