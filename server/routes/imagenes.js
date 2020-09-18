const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    // Validat tipos
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
                }
            });
    }

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        const pathDefault = path.resolve(__dirname, `../assets/img/no-image.jpg`);
        res.sendFile(pathDefault);
    }

});



module.exports = app;