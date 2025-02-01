const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = new Cart();
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (cart) {
            res.json(cart); 
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        const existingProduct = cart.products.find(p => p.product.toString() === req.params.pid);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (cart) {
            cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
            await cart.save();
            res.status(204).send();
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: req.body.products }, { new: true });
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
        }

        const cart = await Cart.findById(req.params.cid);
        if (cart) {
            const product = cart.products.find(p => p.product.toString() === req.params.pid);
            if (product) {
                product.quantity = quantity;
                await cart.save();
                res.json(cart);
            } else {
                res.status(404).send('Producto no encontrado en el carrito');
            }
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (cart) {
            cart.products = [];
            await cart.save();
            res.status(204).send();
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;