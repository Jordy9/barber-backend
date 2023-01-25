const { response } = require("express");
const Cita = require("../models/Cita");
const Negocio = require("../models/Negocio");

const getCita = async( req, res = response ) => {

    const { id } = req.query

    condiciones = [ 'En-espera', 'Atendiendo' ]
    
    try {
        // TODO: Obtener citas mediante barberos, esto hara que si se incluye en un arreglo que le salga
        // const cita = await Cita.find({ 'cita.barberId': { $eq: id }, 'cita.estado': { $in: condiciones } }).sort({ createdAt: -1 })
        const cita = await Cita.find().sort({ createdAt: -1 })

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

        for (let index = 0; index < req.body.cita.length; index++) {
            const element = req.body.cita[index];
            
            let negocio = await Negocio.findOne({ barberId: element.barberId })
            
            const findIndex = negocio.horarioDia.findIndex( e => e.selected === element.usuarioId )
    
            negocio.horarioDia[findIndex] = { ...negocio.horarioDia[findIndex], citaId: citaGuardada._id }
        
            await Negocio.findByIdAndUpdate( negocio._id, negocio, { new: true } )
        }

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
        console.log(error)
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