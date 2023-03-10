const { startService, updateService, removeService, removeAllOrManyService, removeAccidentallyService, createServiceCita, removeServiceCita, updateCitaState, cancelCitaComplete, removeChangeBarberId, pauseService, cancelStopService, addTimeService, updateUsuario } = require("../controllers/socket")
const { comprobarJWT } = require("../helpers/jwt")

class Sockets {

    constructor(io) {

        this.io = io
        this.socketsEvents()
    }

    socketsEvents() {
        //On conecction

        this.io.on('connection', async(socket) => {
            
            const [valido, uid] = comprobarJWT(socket.handshake.query['x-token'])
            
            if (!valido) {
                console.log('socket no identificado')
                return socket.disconnect()
            }

            socket.join(uid)

            socket.on('create-cita', async( cita ) => {
                this.io.emit('created-cita', cita)
            })

            socket.on('update-cita', ( cita ) => {
                this.io.emit('updated-cita', cita)
            })

            socket.on('start-service', async({ firstValue, secondValue, id, thirdValue }) => {
                const resp = await startService( firstValue, secondValue, id, thirdValue )

                this.io.emit('started-service', resp, uid)
            })

            socket.on('pause-service', async( pause, id ) => {
                const resp = await pauseService( pause, id, this.io )

                this.io.emit('paused-service', resp, uid)
            })

            socket.on('cancel-stop-service', async( id ) => {
                const resp = await cancelStopService( id, this.io )

                this.io.emit('canceled-service', resp, uid)
            })

            socket.on('add-time-service', async( id, fouthValue ) => {
                const resp = await addTimeService( id, fouthValue )

                this.io.emit('added-time-service', resp, uid)
            })

            // socket.on('update-service-cita', async({ id, hora, uid, idCita }) => {
            //     const resp = await updateService( id, hora, uid, idCita )

            //     this.io.emit('updated-service-cita', resp)
            // })

            socket.on('create-service-cita-form', async( form, idCita, barberId ) => {
                await createServiceCita( form, uid, this.io, barberId )

                const resp = await updateService( form.barberId, form.hora, form.usuarioId, idCita )

                this.io.emit('updated-service-cita', resp)
            })

            socket.on('remove-service-cita-form', async() => {
                await removeServiceCita( uid )
            })

            socket.on('create-rating', async({ rating, isDelete }) => {
                const resp = await updateUsuario(rating.usuarioId, isDelete)

                this.io.to(rating.usuarioId).emit('updated-usuario', resp)

                this.io.to(rating.barberId).emit('created-rating', rating)
            })

            socket.on('remove-service-cita', async({ id, uid }) => {
                const resp = await removeService( id, uid )

                this.io.emit('removed-service-cita', resp)
            })

            socket.on('remove-meny-service-cita', async( content ) => {
                const resp = await removeAllOrManyService( content )

                this.io.emit('disconect-remove-accidentally-service-cita', resp)
            })

            socket.on('remove-all-or-many-service-cita', async() => {
                const resp = await removeAccidentallyService( uid )

                this.io.emit('disconect-remove-accidentally-service-cita', resp)
            })

            socket.on('update-cita-state', async({ citaId, usuarioId, estado }) => {
                const resp = await updateCitaState( citaId, usuarioId, estado, this.io )

                this.io.emit('updated-cita-state', resp)
            })

            socket.on('cancel-cita', async({ id, formCita }) => {
                const resp = await cancelCitaComplete( id, formCita, this.io )

                this.io.emit('canceled-cita', resp)
            })

            socket.on('disconnect', async() => {
                const resp = await removeAccidentallyService( uid )

                await removeServiceCita( uid )

                this.io.emit('disconect-remove-accidentally-service-cita', resp)
            })
            
        })
    }
}

module.exports = Sockets