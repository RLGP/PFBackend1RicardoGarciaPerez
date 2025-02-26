require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const hbs = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const viewsRouter = require('./routes/views');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const cookieParser = require('cookie-parser'); 

// Conectar a MongoDB
connectDB();

app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Express y Handlebars
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// Registrar el helper 'eq'
const handlebars = hbs.create({
    helpers: {
        eq: (a, b) => a === b
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Montar los enrutadores
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Conexión con Socket
io.on('connection', (socket) => {
    console.log('cliente conectado');

    // Enviar la lista de productos al cliente al conectarse
    Product.find().then(products => {
        socket.emit('products', products);
    }).catch(err => {
        console.error('Error al obtener productos:', err);
    });

    // Manejar la creación de un nuevo producto
    socket.on('newProduct', async (product) => {
        try {
            const newProduct = new Product(product);
            await newProduct.save();
            const products = await Product.find();
            io.emit('products', products); 
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            socket.emit('productError', { message: error.message });
        }
    });

    // Manejar la eliminación de un producto
    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const products = await Product.find();
            io.emit('products', products); 
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            socket.emit('productError', { message: error.message });
        }
    });
});

// Manejar errores globales
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor conectado en el puerto ${PORT}`);
});