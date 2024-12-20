const express = require('express');
const fs = require('fs');
const router = express.Router();
const cartsFilePath = './src/data/carts.json';

const readCarts = () => {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
};

const writeCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts , null, 2));
};

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

router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

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