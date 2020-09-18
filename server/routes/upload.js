const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', verificaToken, function(req, res) {

    const tipo = req.params.tipo;
    const id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado archivo'
                }
            });
    }

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

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los formatos de archivos permitidos son: ' + extensionesValidas.join(', '),
                    extension
                }
            });
    }


    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        //imagen ya cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarImagen(nombreArchivo, 'usuarios');

            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!usuarioDB) {
            borrarImagen(nombreArchivo, 'usuarios');

            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });


        }

        borrarImagen(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioCambiado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: err
                });
            }

            return res.json({
                ok: true,
                usuario: usuarioCambiado
            });

        });

    });

}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                borrarImagen(nombreArchivo, 'productos');

                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            if (!productoDB) {
                borrarImagen(nombreArchivo, 'productos');

                return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'Producto no existe'
                        }
                    });


            }

            borrarImagen(productoDB.img, 'productos');

            productoDB.img = nombreArchivo;

            productoDB.save((err, productoCambiado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: err
                    });
                }

                return res.json({
                    ok: true,
                    producto: productoCambiado
                });

            });

        });

}


function borrarImagen(nombreArchivo, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;