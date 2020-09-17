const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

const app = express();


app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                });
            }

            return res.json({
                ok: true,
                productos: productosDB
            });
        });

});


app.get('/producto/:id', verificaToken, (req, res) => {
    // Producto.findById()
    const id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            return res.json({
                ok: true,
                producto: productoDB
            });
        });

});

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    // Producto.findById()
    const termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true, $or: [{ nombre: regex }, { descripcion: regex }] })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                });
            }

            return res.json({
                ok: true,
                productos: productosDB
            });
        });

});

app.post('/producto', [verificaToken], function(req, res) {
    // req.usuario._id el usuario se suma cuando se ejecuta el VerificaToken

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: "No se ha creado el Producto"
            });
        }

        return res.json({
            ok: true,
            producto: productoDB
        });

    });

});


app.put('/producto/:id', [verificaToken], function(req, res) {
    const id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: "No se ha encontrado el Producto"
            });
        }

        // otra forma de hacer el update 
        productoDB.nombre = body.nombre || productoDB.nombre;
        productoDB.precioUni = body.precioUni || productoDB.precioUni;
        productoDB.descripcion = body.descripcion || productoDB.descripcion;
        productoDB.categoria = body.categoria || productoDB.categoria;
        productoDB.usuario = req.usuario._id || productoDB.usuario;
        productoDB.disponible = body.disponible || productoDB.disponible;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: err
                });
            }

            if (!productoGuardado) {
                return res.status(400).json({
                    ok: false,
                    message: "No se ha modificado el Producto"
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });

});


app.delete('/producto/:id', [verificaToken], function(req, res) {
    //Producto.findByIdAndRemove
    const id = req.params.id;
    const borrar = { disponible: false };

    Producto.findByIdAndUpdate(id, borrar, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })

});

module.exports = app;