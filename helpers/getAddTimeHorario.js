const moment = require("moment/moment")

const getAddTimeHorario = (xTiempo, minHor, fin, horarioDia, lastTime) => {
    let arreglo = [ ...horarioDia ]

    let hasta = ( moment(fin).diff(moment(), 'hours') === 0 ) ? 1 : moment(fin).diff(moment(), 'hours') * 2

    const Tiempo = ( minHor === 'Horas' ) ? 'hours' : 'minutes'

    for (let index = 0; index < hasta; index++) {

        let horaSuma = xTiempo || 30

        if ( index === 0 ) {
            arreglo.push({ fecha: moment(lastTime).clone().add(xTiempo, Tiempo), hora: moment(lastTime).clone().add(xTiempo, Tiempo).format('hh:mm a'), selected: false, citaId: null })

        } else {
            let fecha = moment(arreglo[arreglo.length - 1]?.fecha)?.clone().add(horaSuma, Tiempo)
            let hora = moment(arreglo[arreglo.length - 1]?.fecha)?.clone().add(horaSuma, Tiempo).format('hh:mm a')
            let selected = false
            arreglo.push({ fecha, hora, selected, citaId: null })
        }

        if ( arreglo[arreglo.length - 1].fecha.clone().add(10, 'minutes').isSameOrAfter(moment(fin).subtract(horaSuma, Tiempo)) ) return arreglo

        hasta = hasta + 1
    }
}

module.exports = {
    getAddTimeHorario
}