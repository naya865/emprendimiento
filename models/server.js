const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas (Reemplaza <db_password> y el nombre de tu base de datos si es necesario)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/nrosen_studio?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Conectado exitosamente a MongoDB"))
  .catch(err => console.error("🔴 Error conectando a MongoDB:", err));

// API 1: Obtener todos los productos (GET)
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos de la base de datos" });
    }
});

// API 2: Agregar un producto nuevo (POST) - Opcional para tu panel futuro
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = new Product(req.body);
        await nuevoProducto.save();
        res.status(201).json({ mensaje: "Producto guardado con éxito", producto: nuevoProducto });
    } catch (error) {
        res.status(400).json({ error: "Error al guardar el producto", detalle: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});