const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path; // Ruta del archivo JSON
    }

    // Leer productos desde el archivo
    readProducts() {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, 'utf-8');
            return JSON.parse(data);
        }
        return []; // Si el archivo no existe, retornar un array vacío
    }

    // Guardar productos en el archivo
    writeProducts(products) {
        fs.writeFileSync(this.path, JSON.stringify(products, null, 2));
    }

    // Agregar un nuevo producto
    addProduct(product) {
        const products = this.readProducts();
        const newProduct = {
            id: products.length ? products[products.length - 1].id + 1 : 1,
            title: product.title || 'Sin título',
            description: product.description || 'Sin descripción',
            code: product.code || 'Sin código',
            price: product.price || 0,
            status: product.status !== undefined ? product.status : true,
            stock: product.stock || 0,
            category: product.category || 'Sin categoría',
            thumbnails: product.thumbnails || []
        };
        products.push(newProduct);
        this.writeProducts(products);
        return newProduct;
    }

    // Eliminar un producto por ID
    deleteProduct(id) {
        const products = this.readProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        this.writeProducts(filteredProducts);
        return filteredProducts;
    }

    // Obtener todos los productos
    getProducts() {
        return this.readProducts();
    }
}

module.exports = ProductManager;