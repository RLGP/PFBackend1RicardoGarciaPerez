const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category } = req.query;
        const filter = category ? { category } : {};
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        const products = await Product.paginate(filter, options);

        const buildLink = (page) => {
            let link = `/api/products?limit=${limit}&page=${page}`;
            if (sort && sort !== 'undefined') link += `&sort=${sort}`;
            if (category && category !== 'undefined') link += `&category=${category}`;
            return link;
        };

        res.render('apiProducts', {
            products: products.docs,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? buildLink(products.prevPage) : null,
            nextLink: products.hasNextPage ? buildLink(products.nextPage) : null,
            category,
            sort,
            limit,
            page: products.page,
            totalPages: products.totalPages
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
        }

        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
        if (deletedProduct) {
            res.status(204).send();
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;