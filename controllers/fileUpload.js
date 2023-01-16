const {response} = require('express');
const AWS = require('aws-sdk');
const Image = require('../models/fileUpload');
const Sharp = require('sharp');
const { changeResolution } = require('./ChangeResolution');
const path = require('path')
const fs = require('fs').promises
const ffmpeg = require('./ffp')

const spacesEndpoint = new AWS.Endpoint(process.env.ENDPOINT || "");

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

const getImages = async(req, res = response) => {

    const images = await Image.find()

    try {
        return res.status(200).json({
            ok: true,
            images
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        })
    }
}

const crearImage = async(req, res = response) => {
    const file = req.files.file

    const metadata = await Sharp(file.data).resize(1280, 1280).toBuffer()

    try {
        await s3.putObject({
            ACL: 'public-read',
            Bucket: process.env.BUCKET_NAME || "",
            Body: metadata,
            Key: file.name + req.body.title.slice(1, -1),
            Metadata: {
                "x-amz-meta-user-type": "free"
            }
        }).promise()
        const urlImage = `https://${process.env.BUCKET_NAME}.${process.env.ENDPOINT}/${file.name + req.body.title.slice(1, -1)}`

        const image = new Image({
            url: urlImage,
            key: file.name + req.body.title.slice(1, -1),
            title: req.body.title
        })

        await image.save();
        res.status(201).json({
            ok: true,
            image
        })
    } catch (error) {
        console.log(error) 
        res.status(400).json({
            ok: false,
            error
        })
    }
}

const crearImagePerfil = async(req, res = response) => {
    const file = req.files.file

    const metadata = await Sharp(file.data).resize(250, 250).toBuffer()

    try {
        await s3.putObject({
            ACL: 'public-read',
            Bucket: process.env.BUCKET_NAME || "",
            Body: metadata,
            Key: file.name + req.body.title.slice(1, -1),
            Metadata: {
                "x-amz-meta-user-type": "free"
            }
        }).promise()
        const urlImage = `https://${process.env.BUCKET_NAME}.${process.env.ENDPOINT}/${file.name + req.body.title.slice(1, -1)}`

        const image = new Image({
            url: urlImage,
            key: file.name + req.body.title.slice(1, -1),
            title: req.body.title
        })

        await image.save();
        res.status(201).json({
            ok: true,
            image
        })
    } catch (error) {
        console.log(error) 
        res.status(400).json({
            ok: false,
            error
        })
    }
}

const crearVideo = async(req, res = response) => {
    const file = req.files.file

    let imagen = []

    if (!file) return

    function baseName(str) {
        let base = new String(str).substring(str.lastIndexOf('/') + 1)
        if (base.lastIndexOf('.') !== -1) {
            base = base.substring(0, base.lastIndexOf('.'))
        }

        return base
    }

    let basename = baseName(file.name)

    let newName = [`${basename}-1280x720.mp4`, `${basename}-854x480.mp4`, `${basename}-640x360.mp4`]

    for (let index = 0; index < newName.length; index++) {
        const element = newName[index];
        
        const uploadPath = path.join(__dirname, '../uploads/', element)

        const data = await fs.readFile(uploadPath, function(err, buffer){})

        try {
            await s3.putObject({
                ACL: 'public-read',
                Bucket: process.env.BUCKET_NAME || "",
                Body: data,
                Key: file.name + element + req.body.title.slice(1, -1),
                Metadata: {
                    "x-amz-meta-user-type": "free"
                }
            }).promise()
            const urlImage = `https://${process.env.BUCKET_NAME}.${process.env.ENDPOINT}/${file.name + element + req.body.title.slice(1, -1)}`
    
            const image = new Image({
                url: urlImage,
                key: file.name + element + req.body.title.slice(1, -1),
                title: req.body.title
            })
    
            await image.save();

            imagen.push({
                id: image.id,
                key: image.key,
                url: image.url,
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
            })

            if (index + 1 === newName.length) {
                if (uploadPath) {
                    const pathDir = path.join(__dirname, '../uploads')
                    fs.rm(pathDir, { recursive: true })
                        .then()
                }
            }

        } catch (error) {
            console.log(error) 
            res.status(400).json({
                ok: false,
                error
            })
        }
    }

    return res.status(201).json({
        ok: true,
        image: imagen
    })

}

const crearSeriesBosquejos = async(req, res = response) => {
    const file = req.files.file

    try {
        await s3.putObject({
            ACL: 'public-read',
            Bucket: process.env.BUCKET_NAME || "",
            Body: file.data,
            Key: file.name + req.body.title.slice(1, -1),
            Metadata: {
                "x-amz-meta-user-type": "free"
            }
        }).promise()
        const urlImage = `https://${process.env.BUCKET_NAME}.${process.env.ENDPOINT}/${file.name + req.body.title.slice(1, -1)}`

        const image = new Image({
            url: urlImage,
            key: file.name + req.body.title.slice(1, -1),
            title: req.body.title
        })

        await image.save();
        res.status(201).json({
            ok: true,
            image
        })
    } catch (error) {
        console.log(error) 
        res.status(400).json({
            ok: false,
            error
        })
    }
}

const crearImageGallery = async(req, res = response) => {
    const file = req.files.file

    const metadata = await Sharp(file.data).toBuffer()

    try {
        await s3.putObject({
            ACL: 'public-read',
            Bucket: process.env.BUCKET_NAME || "",
            Body: metadata,
            Key: file.name + req.body.title.slice(1, -1),
            Metadata: {
                "x-amz-meta-user-type": "free"
            }
        }).promise()
        const urlImage = `https://${process.env.BUCKET_NAME}.${process.env.ENDPOINT}/${file.name + req.body.title.slice(1, -1)}`

        const image = new Image({
            url: urlImage,
            key: file.name + req.body.title.slice(1, -1),
            title: req.body.title
        })

        await image.save();
        res.status(201).json({
            ok: true,
            image
        })
    } catch (error) {
        console.log(error) 
        res.status(400).json({
            ok: false,
            error
        })
    }
}

const eliminarImage = async(req, res = response) => {

    const image = await Image.findById(req.params.id);
    
    try {
        await s3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: image?.key,
        }).promise();

        const deleteImage = await Image.findByIdAndDelete(req.params.id);
    
        res.status(200).json({
            ok: true,
            deleteImage
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        })
    }
}

module.exports = {
    getImages,
    crearImage,
    crearImageGallery,
    crearVideo,
    crearImagePerfil,
    crearSeriesBosquejos,
    eliminarImage,
}