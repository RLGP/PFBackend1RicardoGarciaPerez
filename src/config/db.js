const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const connectDB = async () => {
    try {
        // Fix the missing fallback value for MongoDB URI
        const mongoURI = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/ecommerce';
        
        // Remove deprecated options
        await mongoose.connect(mongoURI);
        
        console.log('MongoDB conectado');
        
        // Verificar si hay productos en la base de datos
        const productsCount = await Product.countDocuments();
        
        // Si no hay productos, cargar datos iniciales desde el archivo JSON
        if (productsCount === 0) {
            try {
                const initialDataPath = path.join(__dirname, '../data/initialProducts.json');
                if (fs.existsSync(initialDataPath)) {
                    const initialData = JSON.parse(fs.readFileSync(initialDataPath, 'utf-8'));
                    await Product.insertMany(initialData);
                    console.log('Datos iniciales cargados correctamente');
                } else {
                    // Suppress the message about missing initial data file
                    // console.log('No se encontró el archivo de datos iniciales');
                }
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            }
        }
    } catch (error) {
        console.error('Error al conectarse a MongoDB:', error.message);
        // No terminar el proceso, solo registrar el error
        // process.exit(1);
    }
};

module.exports = connectDB;