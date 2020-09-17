const express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    });



});

// Específico de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
}


app.post('/google', async function(req, res) {

    let tokenGoogle = req.body.idtoken;

    let googleUser = await verify(tokenGoogle)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err: {
                    message: e
                }
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }


        if (usuarioDB) {
            // Usuario con ese correo ya en la base de datos

            if (usuarioDB.google === false) {
                // Se registró previamente con correo y clave normal
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar la autenticación que usó inicialmente'
                });
            } else {
                // usuario ya se había registrado con Google, renuevo su token

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXP });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }
        } else {
            // Si no existe el usuario en la DB
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.clave = ':)';

            // Creo el usuario en la DB
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: err
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
            });

        }


    });

});



module.exports = app;