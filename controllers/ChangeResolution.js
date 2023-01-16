const ffmpeg = require('./ffp')
const path = require('path')
const { response } = require('express')
const fs = require('fs').promises

const changeResolution = (req, res = response) => {

    const file = req.files.file

    if (!file) return

    const uploadPath = path.join(__dirname, '../uploads/', file.name)

    file.mv(uploadPath, function(err) {
        if (err) {
          console.log(err);
        }
    
        console.log('File uploaded to ' + uploadPath)
    });

    function baseName(str) {
        let base = new String(str).substring(str.lastIndexOf('/') + 1)
        if (base.lastIndexOf('.') !== -1) {
            base = base.substring(0, base.lastIndexOf('.'))
        }

        return base
    }

    let filename = uploadPath

    let basename = baseName(filename)

    ffmpeg(filename)
    .output(basename + '-1280x720.mp4')
    .videoCodec('libx264')
    .size('1280x720')

    // Generar el 480p

    .output(basename + '-854x480.mp4')
    .videoCodec('libx264')
    .size('854x480')

    // Generar el 360p

    .output(basename + '-640x360.mp4')
    .videoCodec('libx264')
    .size('640x360')

    .on('error', function(err) {
        console.log(err)
    })

    .on('progress', function(progress) {
        console.log(progress)
    })

    .on('end', function() {
        console.log('Proceso terminado')

        return res.status(200).json({
            ok: true,
            msg: 'video procesado'
        })

    })
    .run()
}

module.exports = {
    changeResolution
}