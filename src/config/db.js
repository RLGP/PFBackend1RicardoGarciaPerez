const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/ecommerce';
        
        await mongoose.connect(mongoURI);
        
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error al conectarse a MongoDB:', error.message);
    }
};

module.exports = connectDB;