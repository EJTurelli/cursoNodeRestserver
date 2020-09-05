const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email rol estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {

                return res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });
        });
});

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        clave: bcrypt.hashSync(body.clave, 10),
        rol: body.rol
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        // usuarioDB.clave = null; //Solución básica pero retorna le nombre del cambio en la DB, no conviene

        return res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.put('/usuario/:id', function(req, res) {

    const id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'rol', 'estado']);

    // Evitar cambiar algo que no queremos acá
    // delete body.email;
    // delete body.clave;
    // delete body.google;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
});

// Borra literal
// app.delete('/usuario/:id', function(req, res) {
//     const id = req.params.id;

//     Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 message: err
//             });
//         }

//         if (!usuarioDB) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioDB
//         });
//     })

// });



// Cambio el estado a false
app.delete('/usuario/:id', function(req, res) {

    const id = req.params.id;
    const borrar = { estado: false };

    Usuario.findByIdAndUpdate(id, borrar, { new: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
});


module.exports = app;