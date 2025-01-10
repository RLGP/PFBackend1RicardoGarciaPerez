const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const hbs = require('express-handlebars');
const path = require('path');
const ProductManager = require('./ProductManager'); 
const viewsRouter = require('./routes/views'); 

const productManager = new ProductManager('./src/data/products.json'); 

app.use(express.static(path.join(__dirname, 'public')));
// Configuración de Express y Handlebars
app.use(express.json());
app.engine('handlebars', hbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Montar el enrutador de vistas
app.use('/', viewsRouter);

// Conexión con Socket
io.on('connection', (socket) => {
    console.log('cliente conectado');

    // Enviar la lista de productos al cliente al conectarse
    socket.emit('products', productManager.getProducts());

    // Manejar la creación de un nuevo producto
    socket.on('newProduct', (product) => {
        const newProduct = productManager.addProduct(product);
        io.emit('products', productManager.getProducts()); // Enviar la lista actualizada a todos los clientes
    });

    // Manejar la eliminación de un producto
    socket.on('deleteProduct', (id) => {
        productManager.deleteProduct(id);
        io.emit('products', productManager.getProducts()); // Enviar la lista actualizada a todos los clientes
    });
});

// Iniciar el servidor
http.listen(8080, () => {
    console.log('Servidor conectado en el puerto 8080');
});