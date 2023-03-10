const { getHorario } = require("../helpers/getHorario")
const Cita = require("../models/Cita")
const Negocio = require("../models/Negocio")
const Usuario = require("../models/Usuario")
const moment = require("moment")
const { getAddTimeHorario } = require("../helpers/getAddTimeHorario")

const updateUsuario = async( id, isDelete ) => {

    if ( !isDelete ) return

    let usuario = await Usuario.findById(id)

    usuario.ratingForm = []

    return await Usuario.findByIdAndUpdate(usuario._id, usuario, { new: true })
}

const startService = async( firstValue, secondValue, id, thirdValue ) => {

    let negocio = await Negocio.findOne({ barberId: id })

    const horarioDia = getHorario(thirdValue.cantidad, thirdValue.tiempo, firstValue, secondValue)

    negocio.xTiempo = thirdValue
    negocio.horas = { desde: firstValue, hasta: secondValue }
    negocio.horarioDia = horarioDia

    return await negocio.save()
}

const pauseService = async( pause, id, io ) => {

    let negocio = await Negocio.findById( id )

    const Tiempo = ( pause.tiempo === 'Horas' ) ? 'hours' : 'minutes'

    const { xTiempo } = negocio

    let nuevoNegocio = []

    const Tiempo2 = ( xTiempo.tiempo === 'Horas' ) ? 'hours' : 'minutes'

    negocio.horarioDia.forEach(async(element, index) => {
    
        const condicion = ( nuevoNegocio.length === 0 ) ? false : true
    
        let fecha = ( condicion ) ? nuevoNegocio[index - 1]?.fecha.clone().add(xTiempo.cantidad, Tiempo2) : moment().clone().add(pause.cantidad, Tiempo)
        let hora = ( condicion ) ? nuevoNegocio[index - 1]?.fecha.clone().add(xTiempo.cantidad, Tiempo2).format('hh:mm a') : moment().clone().add(pause.cantidad, Tiempo).format('hh:mm a')
    
        nuevoNegocio.push({ ...element, fecha, hora })
    
        if ( element.citaId ) {
            
            let cita = await Cita.findById(element.citaId)
    
            const nuevaCita = cita.cita.map( e => ( true ) && { ...e, hora: { hora, fecha } } )
    
            cita.cita = nuevaCita
    
            io.emit('updated-cita', cita)
    
            await Cita.findByIdAndUpdate(cita._id, cita)
    
        }
    })

    negocio.horarioDia = nuevoNegocio

    return await negocio.save()
}

const cancelStopService = async( id, io ) => {

    let negocio = await Negocio.findById( id )

    negocio.horarioDia.forEach(async(element) => {

        if ( moment().isAfter(moment(element.fecha)) === true ) return

        if ( element.citaId ) {
            
            let cita = await Cita.findById(element.citaId)

            const nuevaCita = cita.cita.map( e => ( e.estado === 'En-espera' ) ? { ...e, estado: 'Cancelada' } : e )

            cita.cita = nuevaCita

            io.emit('updated-cita', cita)

            await Cita.findByIdAndUpdate(cita._id, cita)

        }
    });

    negocio.horarioDia = []

    return await negocio.save()
}

const addTimeService = async( id, fouthValue ) => {

    let negocio = await Negocio.findById( id )

    const { xTiempo, horarioDia } = negocio

    const lastTime = horarioDia[horarioDia.length - 1].fecha

    const nuevoHorarioDia = getAddTimeHorario(xTiempo.cantidad, xTiempo.tiempo, fouthValue, horarioDia, lastTime)

    negocio.horarioDia = nuevoHorarioDia

    return await negocio.save()
}

const updateService = async( id, hora, uid, idCita ) => {

    if ( !id ) return

    let negocio = await Negocio.findById(id)

    if ( negocio.horarioDia.some( horario => horario.selected === uid ) ) {

        if ( idCita ) {

            let cita = await Cita.findById(idCita)

            const nuevoNegocioUpdate = negocio.horarioDia.map( horario => horario.selected === uid ? { ...horario, selected: false, citaId: null } : horario )
            const nuevoNegocio = nuevoNegocioUpdate.map( horario => horario.hora === hora ? { ...horario, selected: uid, citaId: cita._id } : horario )
    
            negocio.horarioDia = nuevoNegocio
    
            return await negocio.save()
        } else {

            const nuevoNegocioUpdate = negocio.horarioDia.map( horario => horario.selected === uid ? { ...horario, selected: false, citaId: null } : horario )
            const nuevoNegocio = nuevoNegocioUpdate.map( horario => horario.hora === hora ? { ...horario, selected: uid } : horario )
    
            negocio.horarioDia = nuevoNegocio
    
            return await negocio.save()

        }


    } else {

        if ( negocio.horarioDia.some( horario => horario.hora === hora && horario.selected === false ) ) {

            if ( idCita ) {

                let cita = await Cita.findById(idCita)

                const nuevoNegocio = negocio.horarioDia.map( horario => ( horario.hora === hora && horario.selected === false ) ? { ...horario, selected: uid, citaId: cita._id } : horario )
                
                negocio.horarioDia = nuevoNegocio
        
                return await negocio.save()
            } else {
                const nuevoNegocio = negocio.horarioDia.map( horario => ( horario.hora === hora && horario.selected === false ) ? { ...horario, selected: uid } : horario )
                
                negocio.horarioDia = nuevoNegocio
        
                return await negocio.save()
            }

        } else {
            return negocio
        }

    }

}

const createServiceCita = async( form, uid, io, barberId ) => {

    let usuario = await Usuario.findById( uid )

    if ( usuario.formCita.some( e => e.barberId !== form.barberId && e.usuarioId === form.usuarioId ) ) {
        const formFind = usuario.formCita.find( e => e.barberId !== form.barberId && e.usuarioId === form.usuarioId )

        let negocio = await Negocio.findById( formFind.barberId )

        if ( !negocio ) return

        const nuevoHorario = negocio.horarioDia.map( e => e.selected === formFind.usuarioId ? { ...e, selected: false, citaId: null } : e )

        negocio.horarioDia = nuevoHorario

        io.emit('updated-service-cita', negocio)

        await Negocio.findByIdAndUpdate(negocio._id, negocio)
        
        const nuevoFormCita = usuario.formCita.filter( e => e !== formFind )

        usuario.formCita = [ ...nuevoFormCita, form ]
    
        return await usuario.save()

    } else {

        if ( form.citaActId ) {
            let cita = await Cita.findById( form.citaActId )

            const citaFind = cita.cita.find( ct => ct.usuarioId === form.usuarioId )

            const citaFindIndex = cita.cita.findIndex( ct => ct.usuarioId === form.usuarioId )

            if ( !citaFind ) return

            let negocio = await Negocio.findOne({ barberId: citaFind.barberId })

            if ( !negocio ) return

            // TODO: verificar esta parte

            const nuevoHorario = negocio.horarioDia.map( e => ( e.selected === citaFind.usuarioId ) ? { ...e, selected: false, citaId: null } : e )

            cita.cita[citaFindIndex] = { ...cita.cita[citaFindIndex], hora: { hora: form.hora, fecha: form.fecha }, barberId: barberId }

            await Cita.findByIdAndUpdate(cita._id, cita)

            io.emit('updated-cita', cita)

            negocio.horarioDia = nuevoHorario

            io.emit('updated-service-cita', negocio)

            await Negocio.findByIdAndUpdate(negocio._id, negocio)

            usuario.formCita = [ ...usuario.formCita, form ]
    
            return await usuario.save()

        } else {

            usuario.formCita = [ ...usuario.formCita, form ]
        
            return await usuario.save()
        }

    }

}

const removeServiceCita = async( uid ) => {

    let usuario = await Usuario.findById( uid )

    usuario.formCita = []

    return await usuario.save()
}

const removeService = async( id, uid ) => {

    if ( !id ) return

    let negocio = await Negocio.findOne({ barberId: id })

    const nuevoNegocio = negocio.horarioDia.map( horario => horario.selected === uid ? { ...horario, selected: false, citaId: null } : horario )

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
        
        negocioEncontrado.horarioDia.map( horario => horario.hora === element.hora ? nuevoNegocio.push({ ...horario, selected: false, citaId: null }) : nuevoNegocio.push(horario) )
        
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

                if( !element2?.cita[indexx] ) return

                const { usuarioId, hora, _id } = element2?.cita[indexx]
                
                negocio.horarioDia.map( horario => ( ( horario.selected === usuarioId && horario.hora !== hora.hora && horario.citaId === null ) || ( horario.selected === element.usuarioId && horario.selected !== usuarioId && horario.citaId === null ) ) ? nuevoNegocioFalse.push({ ...horario, selected: false, citaId: null }) : nuevoNegocioFalse.push(horario) )
                                
                negocio.horarioDia = nuevoNegocioFalse
    
                negocio.horarioDia.map( horario => ( horario.hora === hora.hora && horario.citaId === _id ) ? nuevoNegocio.push({ ...horario, selected: usuarioId }) : nuevoNegocio.push(horario) )
    
                negocio.horarioDia = nuevoNegocio

                negocioGuardado.push(negocio)
        
                await Negocio.findByIdAndUpdate(negocio._id, negocio, { new: true })
            });

        } else {

            let negocio = await Negocio.findById( element.barberId )
        
            let nuevoNegocio = []
        
            negocio.horarioDia.map( horario => ( horario.selected === element.usuarioId && horario.citaId === null ) ? nuevoNegocio.push({ ...horario, selected: false, citaId: null }) : nuevoNegocio.push(horario) )
        
            negocio.horarioDia = nuevoNegocio
    
            negocioGuardado.push(negocio)
    
            await Negocio.findByIdAndUpdate(negocio._id, negocio, { new: true })
        }
        
    }

    return negocioGuardado
}

const updateCitaState = async( id, usuarioId, estado, io ) => {

    let cita = await Cita.findById(id)

    let usuario = await Usuario.findById(cita.cita[0].usuarioId)

    const indexCita = cita.cita.findIndex( e => e.usuarioId === usuarioId )

    cita.cita[indexCita].estado = estado

    if ( estado === 'Finalizada' ) {
        let [ negocio ] = await Negocio.find({ barberId: cita.cita[indexCita].barberId })

        const rating = {
            usuarioId: cita.cita[0].usuarioId,
            barberId: cita.cita[0].barberId,
            calificacion: 0
        }

        usuario.ratingForm = [ ...usuario.ratingForm, rating ]
        
        usuario.save()

        const indexNegocio = negocio.horarioDia.findIndex( e => e.selected === usuarioId )
        
        if ( indexNegocio > -1 ) {

            const horaMoment = ( negocio.horarioDia.length === 1 ) 
                ? moment(negocio.horarioDia[0].fecha).clone().add(negocio.xTiempo.cantidad, 'minutes')
                : negocio.horarioDia[1].fecha
    
            const minService = negocio.servicios.reduce(function(prev, curr) {
                return prev.tiempo < curr.tiempo ? prev : curr;
            });

            if (moment(horaMoment).diff(moment()) > ( minService.tiempo + 5 )) {

                negocio.horarioDia[indexNegocio] = { fecha: new Date().getTime(), hora: moment().format('hh:mm a'), selected: false, citaId: null }

                io.emit('updated-service-cita', negocio)
    
                await Negocio.findByIdAndUpdate( negocio._id, negocio, { new: true } )
            }
    
        }

    }

    return await Cita.findByIdAndUpdate( id, cita, { new: true } )
}

const cancelCitaComplete = async( id, citaForm, io ) => {

    let nuevaCita = []

    for (let index = 0; index < citaForm.cita.length; index++) {
        const element = citaForm.cita[index];

        if ( !element.barberId ) return

        let negocio = await Negocio.findOne({ barberId: element.barberId })

        const nuevoNegocio = negocio.horarioDia.map( horario => horario.selected === element.usuarioId ? { ...horario, selected: false, citaId: null } : horario )

        negocio.horarioDia = nuevoNegocio

        const negocioGuardado = await Negocio.findByIdAndUpdate(negocio._id, negocio, { new: true })

        if ( !negocioGuardado ) return

        io.emit('updated-service-cita', negocio)

        let cita = await Cita.findById(id)

        const indexCita = cita.cita.findIndex( e => e.usuarioId === element.usuarioId )

        cita.cita[indexCita].estado = 'Cancelada'

        nuevaCita.push(cita)

        await Cita.findByIdAndUpdate( id, cita, { new: true } )
        
    }

    return nuevaCita

}

const updateAll = async( io ) => {
    
    let nuevoNegocio = []
    
    const negocio = await Negocio.find()
    
    negocio.forEach(async(element) => {

        const minService = element.servicios.reduce(function(prev, curr) {
            return prev.tiempo < curr.tiempo ? prev : curr;
        });

        const serviceTime = ( minService ) ? minService : 15

        if ( element.horarioDia?.length === 0 ) return

        const tiempoDelete = element.xTiempo.cantidad / 2

        const horaMoment = ( element.horarioDia.length === 1 ) 
            ? moment(element.horarioDia[0].fecha).clone().add(element.xTiempo.cantidad, 'minutes')
            : element.horarioDia[1].fecha

        const horaMomentDelete = ( element.horarioDia.length === 1 ) 
            ? moment(element.horarioDia[0].fecha).clone().add(tiempoDelete, 'minutes')
            : element.horarioDia[1].fecha

        if ( element.horarioDia[0].selected === false && element.horarioDia[0].hora.length < 12 && moment(horaMoment).diff(moment(), 'minutes') > 6 && moment(horaMoment).clone().subtract(5, 'minutes').diff(moment(), 'minutes') <= serviceTime.tiempo ) {

            element.horarioDia[0] = { fecha: new Date().getTime(), hora: moment().format('hh:mm a') + ` Solo ${serviceTime.servicio} `, selected: false, citaId: null }

            // { $push: { horarioDia: { $each: [ { fecha: new Date().getTime(), hora: moment().format('hh:mm: a') + ' Solo cerquillo', selected: false } ], $position: 1 } } }

            nuevoNegocio.push(element)

            await Negocio.findByIdAndUpdate(element._id, element, { new: true })
        }

        // console.log( moment(horaMomentDelete).diff(moment(), 'minutes'))

        if ( moment(horaMomentDelete).diff(moment(), 'minutes') <= 5 ) {

            const horarioFiltrado = element.horarioDia.filter( e => ( moment().isBefore(moment(e.fecha) ) ) )

            element.horarioDia = horarioFiltrado

            nuevoNegocio.push(element)

            await Negocio.findByIdAndUpdate(element._id, element, { new: true })
        }

        if ( moment().isSameOrAfter(moment(element?.horarioDia[0]?.fecha)) && element?.horarioDia[0]?.selected !== false ) {

            if ( !element.horarioDia[0]?.citaId ) return

            let cita = await Cita.findById( element.horarioDia[0].citaId )

            if ( !cita ) return

            const citaIndex = cita.cita.findIndex( e => e.usuarioId === element.horarioDia[0].selected )

            if ( citaIndex <= -1 ) return

            if ( cita.cita[citaIndex].estado !== 'En-espera' ) return
            
            cita.cita[citaIndex].estado = 'Atendiendo'

            io.emit('update-cita-by-state-finish', cita)

            await Cita.findByIdAndUpdate( cita._id, cita, { new: true } )
        }
        
    });

    return nuevoNegocio

}

module.exports = {
    updateUsuario,
    startService,
    pauseService,
    cancelStopService,
    addTimeService,
    updateService,
    removeService,
    removeAllOrManyService,
    removeAccidentallyService,
    createServiceCita,
    removeServiceCita,
    updateAll,
    updateCitaState,
    cancelCitaComplete,
}