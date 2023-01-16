const { startService, updateService, removeService, removeAllOrManyService, removeAccidentallyService, createServiceCita, removeServiceCita } = require("../controllers/socket")
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

            if ( uid ) {
                
            }

            socket.on('start-service', async({ firstValue, secondValue, id, thirdValue }) => {
                const resp = await startService( firstValue, secondValue, id, thirdValue )

                this.io.to(uid).emit('started-service', resp)
            })

            socket.on('update-service-cita', async({ id, hora, uid }) => {
                const resp = await updateService( id, hora, uid )

                this.io.emit('updated-service-cita', resp)
            })

            socket.on('create-service-cita-form', async( form ) => {
                await createServiceCita( form, uid )
            })

            socket.on('remove-service-cita-form', async() => {
                await removeServiceCita( uid )
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

                await removeServiceCita( uid )

                this.io.emit('disconect-remove-accidentally-service-cita', resp)
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