const { response } = require("express");
const Rating = require("../models/rating");

const getRating = async( req, res = response ) => {
    
    try {
        const rating = await Rating.find()

        res.status(200).json({
            ok: true,
            rating
        })
    } catch (error) {
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