const { response } = require("express");
const moment = require("moment/moment");
const Cita = require("../models/Cita");
const Negocio = require("../models/Negocio");

const getCita = async( req, res = response ) => {

    let { id, page, size, condition, start, end } = req.query

    const condiciones = [ 'En-espera', 'Atendiendo' ]

    if ( start === 'undefined' || end === 'undefined' ) {
        start = moment().startOf('month').format('YYYY-MM-DDTHH:mm:ss')
        end = moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss')
    }
 
    if (!parseInt(page)) {
        page = 1
    }

    if (!parseInt(size)) {
        size = 15
    }

    const limit = parseInt(size)
    const skip = (page - 1) * size
    
    try {

        if ( condition === 'true' ) {

            Cita.find({ 'cita.barberId': { $eq: id }, 'cita.estado': { $in: condiciones }, createdAt: {$gte: start, $lte: end} }).sort({ createdAt: -1 }).limit(limit).skip(skip).exec((err, cita) => {
                Cita.find({ 'cita.barberId': { $eq: id }, 'cita.estado': { $in: condiciones }, createdAt: {$gte: start, $lte: end} }).count((err, count) => {
                    if (err) return false
                    res.status(200).json({
                        ok: true,
                        cita,
                        page: parseInt(page),
                        total: Math.ceil(count/limit),
                        count
                    })
                })
            })
            
        } else {

            Cita.find({ 'cita.barberId': { $eq: id }, createdAt: {$gte: start, $lte: end} }).sort({ createdAt: -1 }).limit(limit).skip(skip).exec((err, cita) => {
                Cita.find({ 'cita.barberId': { $eq: id }, createdAt: {$gte: start, $lte: end} }).count((err, count) => {
                    if (err) return false
                    res.status(200).json({
                        ok: true,
                        cita,
                        page: parseInt(page),
                        total: Math.ceil(count/limit),
                        count
                    })
                })
            })

        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const getCitaList = async( req, res = response ) => {

    let { id, page, size } = req.query

    if (!parseInt(page)) {
        page = 1
    }

    if (!parseInt(size)) {
        size = 15
    }

    const limit = parseInt(size)
    const skip = (parseInt(page) - 1) * limit
    
    try {
        // const usuario = await Usuario.findById(id)

        // if ( !usuario ) return

        // if ( usuario.role )

        // TODO: Obtener citas mediante barberos, esto hara que si se incluye en un arreglo que le salga
        // const cita = await Cita.find({ 'cita.barberId': { $eq: id } }).sort({ createdAt: -1 })

        Cita.find({ 'userId': { $eq: id } }).sort({ createdAt: -1 }).limit(limit).skip(skip).exec((err, cita) => {
            Cita.find({ 'userId': { $eq: id } }).count((err, count) => {
                if (err) return false
                res.status(200).json({
                    ok: true,
                    cita,
                    page: parseInt(page),
                    total: Math.ceil(count/limit),
                    count
                })
            })
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
    getCitaList,
    crearCita,
    actualizarCita
}