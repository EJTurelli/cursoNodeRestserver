const express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


app.post('/login', function(req, res) {

    let body = req.body;

    Usuario.findOne({ email: body.email, estado: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario y/o Clave no encontrados'
                }
            });
        }

        if (!bcrypt.compareSync(body.clave || '', usuarioDB.clave)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario y/o Clave no encontrados'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXP });

        return res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    })



});






module.exports = app;