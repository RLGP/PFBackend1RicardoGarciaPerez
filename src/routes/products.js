const express = require('express');
const fs = require('fs');
const router = express.Router();
const productsFilePath = './src/data/products.json';

// Helper function to read products from file
const readProducts = () => {
    const data = fs.readFileSync(productsFilePath);
    return JSON.parse(data);
};

// Helper function to write products to file
const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// GET /api/products/
router.get('/', (req, res) => {
    const products = readProducts();
    const limit = parseInt(req.query.limit);
    const result = limit ? products.slice(0, limit) : products;
    res.json(result);
});

// GET /api/products/:pid
router.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(req.params.pid));
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// POST /api/products/
router.post('/', (req, res) => {
    const products = readProducts();
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status !== undefined ? req.body.status : true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails || []
    };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// PUT /api/products/:pid
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index !== -1) {
        const updatedProduct = { ...products[index], ...req.body };
        products[index] = updatedProduct;
        writeProducts(products);
        res.json(updatedProduct);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', (req, res) => {
    const products = readProducts();
    const filteredProducts = products.filter(p => p.id !== parseInt(req.params.pid));
    if (filteredProducts.length < products.length) {
        writeProducts(filteredProducts);
        res.status(204).send();
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

module.exports = router;