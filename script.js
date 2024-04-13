const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path; // Ruta del archivo de productos
        this.products = this.readJSONFile();
        this.nextProductId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    }

    readJSONFile() {
        try {
            return JSON.parse(fs.readFileSync(this.path, 'utf8'));
        } catch (e) {
            console.log("Error leyendo el archivo:", e);
            return []; // Retorna un arreglo vacío si no puede leer el archivo
        }
    }

    writeJSONFile() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (e) {
            console.log("Error escribiendo en el archivo:", e);
        }
    }

    addProduct(product) {
        // Valido que todos los campos esten completos
        if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || product.stock == null) {
            console.log("Error: Todos los campos son obligatorios.");
            return;
        }

        // Valido que el código no esté repetido
        if (this.products.some(p => p.code === product.code)) {
            console.log("Error: El código ya existe para otro producto.");
            return;
        }

        // Asignp el id autoincrementable
        product.id = this.nextProductId++;

        // Agrego el producto al arreglo y actualizo el archivo
        this.products.push(product);
        this.writeJSONFile();

        console.log(`Producto ${product.title} agregado con éxito.`);
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            return product;
        } else {
            console.log("Error: Producto no encontrado");
            return null;
        }
    }

    updateProduct(id, updatedProduct) {
        const productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = {...this.products[productIndex], ...updatedProduct, id: id}; // Se asegura de no cambiar el id
            this.writeJSONFile();
            console.log(`Producto con id ${id} actualizado con éxito.`);
        } else {
            console.log("Error: Producto no encontrado");
        }
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.writeJSONFile();
            console.log(`Producto con id ${id} eliminado con éxito.`);
        } else {
            console.log("Error: Producto no encontrado");
        }
    }
}

// Testeo
const manager = new ProductManager('./products.json');

// Agregar algunos productos
manager.addProduct({
  title: "Producto 1",
  description: "Descripción del Producto 1",
  price: 9.99,
  thumbnail: "imagen1.jpg",
  code: "COD001",
  stock: 10
});

manager.addProduct({
  title: "Producto 2",
  description: "Descripción del Producto 2",
  price: 19.99,
  thumbnail: "imagen2.jpg",
  code: "COD002",
  stock: 5
});

// Intentar agregar un producto sin stock (debería fallar)
manager.addProduct({
  title: "Producto 3",
  description: "Descripción del Producto 3",
  price: 29.99,
  thumbnail: "imagen3.jpg",
  code: "COD003",
  // stock no está definido aquí, entonces debería dar error
});

// Intentar agregar un producto con un código que ya existe (debería fallar)
manager.addProduct({
  title: "Producto 4",
  description: "Descripción del Producto 4",
  price: 39.99,
  thumbnail: "imagen4.jpg",
  code: "COD001", // Código duplicado
  stock: 8
});

// Consultar todos los productos
console.log('Todos los productos:', manager.getProducts());

// Consultar un producto por ID que existe
console.log('Producto con ID 1:', manager.getProductById(1));

// Consultar un producto por ID que no existe
console.log('Producto con ID 10 (no existe):', manager.getProductById(10));

// Actualizar un producto que existe
manager.updateProduct(1, { price: 11.99, stock: 20 });

// Intentar actualizar un producto que no existe (debería fallar)
manager.updateProduct(10, { price: 12.99 });

// Eliminar un producto que existe
manager.deleteProduct(2);

// Intentar eliminar un producto que no existe (debería fallar)
manager.deleteProduct(10);

// Consultar todos los productos después de las eliminaciones
console.log('Todos los productos después de eliminar:', manager.getProducts());