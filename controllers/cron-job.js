const cron = require('node-cron')
const { updateAll } = require('./socket')

const updateTime = (io) => {

    cron.schedule('*/1 * * * *', async() => {
        const resp = await updateAll()

        if ( resp.length > 0 ) {
            io.emit('update-negocio-by-minute', resp)
        }

    })
}

module.exports = updateTime