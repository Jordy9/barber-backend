const { getHorario } = require("../helpers/getHorario")
const Cita = require("../models/Cita")
const Negocio = require("../models/Negocio")
const Usuario = require("../models/Usuario")
const moment = require("moment")
const e = require("cors")
const { findByIdAndUpdate } = require("../models/Cita")

const startService = async( firstValue, secondValue, id, thirdValue ) => {

    let negocio = await Negocio.findOne({ barberId: id })

    const horarioDia = getHorario(thirdValue.cantidad, thirdValue.tiempo, firstValue, secondValue)

    negocio.xTiempo = thirdValue
    negocio.horas = { desde: firstValue, hasta: secondValue }
    negocio.horarioDia = horarioDia

    return await negocio.save()
}

const updateService = async( id, hora, uid ) => {

    if ( !id ) return

    let negocio = await Negocio.findById(id)

    if ( negocio.horarioDia.some( horario => horario.selected === uid ) ) {
        const nuevoNegocioUpdate = negocio.horarioDia.map( horario => horario.selected === uid ? { ...horario, selected: false } : horario )
        const nuevoNegocio = nuevoNegocioUpdate.map( horario => horario.hora === hora ? { ...horario, selected: uid } : horario )

        negocio.horarioDia = nuevoNegocio

        return await negocio.save()

    } else {

        if ( negocio.horarioDia.some( horario => horario.hora === hora && horario.selected === false ) ) {

            const nuevoNegocio = negocio.horarioDia.map( horario => ( horario.hora === hora && horario.selected === false ) ? { ...horario, selected: uid } : horario )
            
            negocio.horarioDia = nuevoNegocio
    
            return await negocio.save()
        } else {
            return negocio
        }

    }

}

const createServiceCita = async( form, uid ) => {

    let usuario = await Usuario.findById( uid )

    usuario.formCita = [ ...usuario.formCita, form ]

    return await usuario.save()
}

const removeServiceCita = async( uid ) => {

    let usuario = await Usuario.findById( uid )

    usuario.formCita = []

    return await usuario.save()
}

const removeService = async( id, uid ) => {

    if ( !id ) return

    let negocio = await Negocio.findOne({ barberId: id })

    const nuevoNegocio = negocio.horarioDia.map( horario => horario.selected === uid ? { ...horario, selected: false } : horario )

    negocio.horarioDia = nuevoNegocio

    return await negocio.save()
}

const removeAllOrManyService = async( content ) => {

    let negocio = await Negocio.find()

    let negocioGuardado = []

    content.forEach(async(element) => {
        
        let nuevoNegocio = []
        
        if ( !element.barberId ) return
    
        const negocioEncontrado = negocio.find( e => e.barberId === element.barberId )
        
        negocioEncontrado.horarioDia.map( horario => horario.hora === element.hora ? nuevoNegocio.push({ ...horario, selected: false }) : nuevoNegocio.push(horario) )
        
        negocioEncontrado.horarioDia = nuevoNegocio
    
        negocioGuardado.push(negocioEncontrado)
        
        await Negocio.findByIdAndUpdate(negocioEncontrado._id, negocioEncontrado, { new: true })
        
    });

    return negocioGuardado

}

const removeAccidentallyService = async( uid ) => {

    if ( !uid ) return

    let usuario = await Usuario.findById( uid )

    if ( !usuario ) return

    let citas = await Cita.find({ userId: uid })

    let negocioGuardado = []

    if ( !usuario.formCita || usuario.formCita.length === 0 ) return

    for (let index = 0; index < usuario.formCita.length; index++) {
        const element = usuario.formCita[index];

        if ( element.estado === 'Update' ) {
            let negocio = await Negocio.findById( element.barberId )
            let nuevoNegocioFalse = []
            let nuevoNegocio = []

            citas.forEach(async(element2, indexx) => {

                const { usuarioId, hora } = element2.cita[indexx]
                
                negocio.horarioDia.map( horario => ( ( horario.selected === usuarioId && horario.hora !== hora ) || ( horario.selected === element.usuarioId && horario.selected !== usuarioId ) ) ? nuevoNegocioFalse.push({ ...horario, selected: false }) : nuevoNegocioFalse.push(horario) )
                                
                negocio.horarioDia = nuevoNegocioFalse
    
                negocio.horarioDia.map( horario => ( horario.hora === hora ) ? nuevoNegocio.push({ ...horario, selected: usuarioId }) : ( element2.cita.some( ct => horario.hora === ct.hora ) ) ? nuevoNegocio.push({ ...horario, selected: element.usuarioId }) : nuevoNegocio.push(horario) )
    
                negocio.horarioDia = nuevoNegocio

                negocioGuardado.push(negocio)
        
                await Negocio.findByIdAndUpdate(negocio._id, negocio, { new: true })
            });

        } else {

            let negocio = await Negocio.findById( element.barberId )
        
            let nuevoNegocio = []
        
            negocio.horarioDia.map( horario => ( horario.selected === element.usuarioId && horario.hora === element.hora ) ? nuevoNegocio.push({ ...horario, selected: false }) : nuevoNegocio.push(horario) )
        
            negocio.horarioDia = nuevoNegocio
    
            negocioGuardado.push(negocio)
    
            await Negocio.findByIdAndUpdate(negocio._id, negocio, { new: true })
        }
        
    }

    return negocioGuardado
}

const updateCitaState = async( id, usuarioId, estado ) => {

    let cita = await Cita.findById(id)

    const indexCita = cita.cita.findIndex( e => e.usuarioId === usuarioId )

    cita.cita[indexCita].estado = estado

    return await Cita.findByIdAndUpdate( id, cita, { new: true } )
}


const updateAll = async() => {
    
    let nuevoNegocio = []
    
    const negocio = await Negocio.find()
    
    negocio.forEach(async(element) => {

        const minService = element.servicios.reduce(function(prev, curr) {
            return prev.tiempo < curr.tiempo ? prev : curr;
        });

        const serviceTime = ( minService ) ? minService : 15

        if ( element.horarioDia.length === 0 ) return

        const tiempoDelete = element.xTiempo.cantidad / 2

        const horaMoment = ( element.horarioDia.length === 1 ) 
            ? moment(element.horarioDia[0].fecha).clone().add(element.xTiempo.cantidad, 'minutes')
            : element.horarioDia[1].fecha

        const horaMomentDelete = ( element.horarioDia.length === 1 ) 
            ? moment(element.horarioDia[0].fecha).clone().add(tiempoDelete, 'minutes')
            : element.horarioDia[1].fecha

        if ( element.horarioDia[0].selected === false && element.horarioDia[0].hora.length < 12 && moment(horaMoment).diff(moment(), 'minutes') > 6 && moment(horaMoment).clone().subtract(5, 'minutes').diff(moment(), 'minutes') <= serviceTime.tiempo ) {

            element.horarioDia[0] = { fecha: new Date().getTime(), hora: moment().format('hh:mm a') + ` Solo ${serviceTime.servicio} `, selected: false }

            // { $push: { horarioDia: { $each: [ { fecha: new Date().getTime(), hora: moment().format('hh:mm: a') + ' Solo cerquillo', selected: false } ], $position: 1 } } }

            nuevoNegocio.push(element)

            await Negocio.findByIdAndUpdate(element._id, element, { new: true })
        }

        // console.log( moment(horaMomentDelete).diff(moment(), 'minutes'))

        if ( moment(horaMomentDelete).diff(moment(), 'minutes') <= 5 ) {

            const horarioFiltrado = element.horarioDia.filter( e => e.selected === false && moment().isBefore(moment(e.fecha), 'minutes'))

            element.horarioDia = horarioFiltrado

            nuevoNegocio.push(element)

            await Negocio.findByIdAndUpdate(element._id, element, { new: true })
        }
        
    });

    return nuevoNegocio

}

module.exports = {
    startService,
    updateService,
    removeService,
    removeAllOrManyService,
    removeAccidentallyService,
    createServiceCita,
    removeServiceCita,
    updateAll,
    updateCitaState
}