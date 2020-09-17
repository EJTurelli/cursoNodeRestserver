const express = require('express');

const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');

const app = express();


app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                });
            }

            return res.json({
                ok: true,
                categorias: categoriasDB
            });
        });

});


app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById()
    const id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


app.post('/categoria', [verificaToken], function(req, res) {
    // req.usuario._id el usuario se suma cuando se ejecuta el VerificaToken

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: "No se ha creado la Categoría"
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});


app.put('/categoria/:id', [verificaToken], function(req, res) {
    const id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: "No se ha modificado la Categoría"
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


app.delete('/categoria/:id', [verificaToken, verificaAdminRol], function(req, res) {
    //Categoria.findByIdAndRemove
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })

});

module.exports = app;