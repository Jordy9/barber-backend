const http = require('http')
const socketio = require('socket.io')
const Sockets = require('./Sockets')
const express = require('express')
const path = require('path')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { dbConnection } = require('../database/config')
const updateTime = require('../controllers/cron-job')

class Server {

    constructor() {
        this.app = express()
        this.port = process.env.PORT

        //Http server
        this.server = http.createServer(this.app)
    
        //Configuraciones de sockets
        this.io = socketio(this.server, {/* Configuraciones */})

        //Base de datos
        dbConnection()

        updateTime(this.io)
    }

    middlewares () {

        this.app.use(express.static('public'))

        this.app.use(fileUpload({
            // useTempFiles: true,
            tempFileDir: '/temp',
            createParentPath: true
        }))
        
        //Cors
        this.app.use(cors())

        //Parseo del body
        this.app.use(express.json())

        // //Rutas
        this.app.use('/api/auth', require('../routes/auth'));
        this.app.use('/api/negocio', require('../routes/negocio'));
        this.app.use('/api/cita', require('../routes/cita'));
        this.app.use('/api/rating', require('../routes/rating'));

        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public', 'index.html'))
        })
    }

    configuracionesSockets () {
        new Sockets(this.io)
    }

    execute () {

        //Inicializar Middlewares
        this.middlewares()

        //Inicializar Sockets
        this.configuracionesSockets()

        //Escuchar peticiones
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto:', this.port)
        });
    }
}




module.exports = Server