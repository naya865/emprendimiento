const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    descripcion: { type: String, required: true },
    tallas: { type: [String], required: true },
    imagen: { type: String, required: true },
    imagenes: { type: [String], required: true }
});

module.exports = mongoose.model('Product', productSchema);