var jwt = require('jsonwebtoken');


// VERIFICAR TOKEN
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });


};

let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });


};

// VERIFICAR ROL DE ADMIN
let verificaAdminRol = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.rol === 'ADMIN_ROL') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Permisos no validos'
            }
        });
    }

};


module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImg
}