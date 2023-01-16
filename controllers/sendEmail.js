const { response } = require('express');
const nodemailer = require('nodemailer');


const RespondEmail = (req, res = response) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: `${req.body.email}`,
            pass: 'qyttwmgxexbkzizq'
        }
    })
    
    transporter.verify().then(() => {
        console.log('Ready for send emails');
    })

    var mailOptions = {
        from: `${req.body.email}`, // dirección del remitente (quién envía)
        to: `${req.body.email2}`, // lista de receptores (quién recibe)
        subject: `${req.body.subject}`, // Línea de asunto
        text: `<b>${req.body.title}</b>`, //cuerpo de texto plano
        html: `${req.body.descripcion}` // cuerpo html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
    
        console.log('Message sent: ' + info.response);
    });
}

module.exports = {
    RespondEmail
}