const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const rolesValidos = {
    values: ['ADMIN_ROL', 'USER_ROL'],
    message: '{VALUE} no es válido'
}

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario'],
    },
    clave: {
        type: String,
        required: [true, 'La clave es necesaria'],
    },
    img: {
        type: String,
        required: false,
    },
    rol: {
        type: String,
        default: 'USER_ROL',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true,
    },
    google: {
        type: Boolean,
        default: false,
    }
});

// no se puede usar una función de flecha porque nos hace falta el this
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();

    delete userObject.clave;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);