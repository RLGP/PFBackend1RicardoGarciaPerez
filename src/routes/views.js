const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const router = express.Router();

router.get('/products', async (req, res) => {
    const { category, sort, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};
    const options = {
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const products = await Product.paginate(filter, options);

    let cartId = req.cookies.cartId;
    if (!cartId) {
        const newCart = new Cart();
        await newCart.save();
        cartId = newCart._id;
        res.cookie('cartId', cartId, { httpOnly: true });
    }

    const buildLink = (page) => {
        let link = `/products?page=${page}`;
        if (limit !== 2) link += `&limit=${limit}`;
        if (sort && sort !== 'undefined') link += `&sort=${sort}`;
        if (category && category !== 'undefined') link += `&category=${category}`;
        return link;
    };

    res.render('products', {
        products: products.docs,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        prevLink: products.hasPrevPage ? buildLink(products.prevPage) : null,
        nextLink: products.hasNextPage ? buildLink(products.nextPage) : null,
        cartId, 
        category,
        sort,
        page: products.page,
        totalPages: products.totalPages
    });
});

router.get('/products/:pid', async (req, res) => {
    const product = await Product.findById(req.params.pid);
    res.render('product', { product, cartId: req.cookies.cartId });
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        
        // Verificar si el carrito existe
        if (!cart) {
            const newCart = new Cart();
            await newCart.save();
            res.cookie('cartId', newCart._id, { httpOnly: true });
            return res.redirect(`/carts/${newCart._id}`);
        }
        
        res.render('cart', { products: cart.products, cartId: req.params.cid });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).render('error', { 
            message: 'Error al obtener el carrito',
            error: { status: 500 }
        });
    }
});

router.post('/change-cart', async (req, res) => {
    const { cartId } = req.body;
    res.cookie('cartId', cartId, { httpOnly: true });
    res.redirect('/products');
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al cargar la página');
    }
});

module.exports = router;