const { response } = require("express");
const { getStars, getTimeEarly, getPreferTime, getCardsInfo, getServiceStars } = require("../helpers/getBarbersStastics");
const Cita = require("../models/Cita");
const Negocio = require("../models/Negocio");
const Rating = require("../models/rating");
const moment = require('moment')

const getRating = async( req, res = response ) => {

    const { id } = req.query
    
    const fechaInicio = moment().startOf('month').format('YYYY-MM-DDTHH:mm:ss')

    const fechaFin = moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss')

    try {

        const negocio = await Negocio.findOne({ barberId: id })

        const rating = await Rating.find({ barberId: id, createdAt: {$gte: fechaInicio, $lte: fechaFin} })

        const cita = await Cita.find({ 'cita.barberId': id, createdAt: {$gte: fechaInicio, $lte: fechaFin} })

        const ratingSum = getStars(rating)

        const minTime = getTimeEarly(cita)
    
        const preferTime = getPreferTime(cita)
    
        const cardInfo = getCardsInfo(cita)

        const sumService = getServiceStars(negocio, cita)

        res.status(200).json({
            ok: true,
            rating: { ratingSum, minTime, preferTime, cardInfo, sumService }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hubo un problema'
        })
    }
}

const crearRating = async( req, res = response ) => {

    const rating = new Rating( req.body )

    try {

        const ratingGuardado = await rating.save()

        res.status(200).json({
            ok: true,
            rating: ratingGuardado
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
    getRating,
    crearRating,
}