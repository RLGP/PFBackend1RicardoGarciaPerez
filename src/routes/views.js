const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {
    const products = readProducts();
    res.render('home', { products });
});

router.get('/realtimeproducts', (req, res) => {
    const products = readProducts();
    res.render('realTimeProducts', { products });
});

// Funciones para leer y escribir productos
const readProducts = () => {
    const data = fs.readFileSync('./src/data/products.json');
    return JSON.parse(data);
};

module.exports = router;