var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var productoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    precioUni: { type: Number, required: [true, 'El precio únitario es necesario'] },
    descripcion: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    img: { type: String, required: false },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Producto', productoSchema);