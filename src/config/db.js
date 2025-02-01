const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/ecommerce');
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error al conectarse a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;