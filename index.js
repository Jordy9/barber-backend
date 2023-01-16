require('dotenv').config();
const Server = require('./sockets/Server');

//Socket
const server = new Server()
server.execute()