const moment = require("moment/moment")

const getHorario = (xTiempo, minHor, inicio, fin) => {
    let arreglo = []

    // let sumaMinutosByXtiempo = 10

    // if ( ( xTiempo >= 40 && xTiempo <= 45 ) && minHor === 'Minutos' ) {
    //     sumaMinutosByXtiempo = 15
    // }

    // if ( ( xTiempo > 45 && xTiempo < 60 ) && minHor === 'Minutos' ) {
    //     sumaMinutosByXtiempo = 20
    // }

    let hasta = ( moment(fin).diff(moment(), 'hours') === 0 ) ? 1 : moment(fin).diff(moment(), 'hours') * 2

    const Tiempo = ( minHor === 'Horas' ) ? 'hours' : 'minutes'

    for (let index = 0; index < hasta; index++) {

        let horaSuma = xTiempo || 30

        if ( index === 0 ) {
            arreglo.push({ fecha: moment(inicio), hora: moment(inicio).format('hh:mm a'), selected: false, citaId: null })
        } else {
            let fecha = arreglo[index - 1]?.fecha?.clone().add(horaSuma, Tiempo)
            let hora = arreglo[index - 1]?.fecha?.clone().add(horaSuma, Tiempo).format('hh:mm a')
            let selected = false
            arreglo.push({ fecha, hora, selected, citaId: null })
        }

        if ( arreglo[arreglo.length - 1].fecha.clone().add(10, 'minutes').isSameOrAfter(moment(fin).subtract(horaSuma, Tiempo)) ) return arreglo

        hasta = hasta + 1
    }
}

module.exports = {
    getHorario
}