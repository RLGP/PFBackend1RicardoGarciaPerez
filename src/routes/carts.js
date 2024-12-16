const express = require('express');
const fs = require('fs');
const router = express.Router();
const cartsFilePath = './src/data/carts.json';

// Helper function to read carts from file
const readCarts = () => {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
};

// Helper function to write carts to file
const writeCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts , null, 2));
};

// POST /api/carts/
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: carts.length ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

// GET /api/carts/:cid
router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (cart) {
        const productId = parseInt(req.params.pid);
        const existingProduct = cart.products.find(p => p.product === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }
        writeCarts(carts);
        res.status(200).json(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

module.exports = router;