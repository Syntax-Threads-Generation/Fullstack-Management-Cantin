const pool = require('../config/db');

const createProduct = async (id_user, product_name, product_price, categories) => {
    const query = 'INSERT INTO products (id_user, product_name, product_price, categories) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [id_user, product_name, product_price, categories];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllProducts = async () => {
    const query = 'SELECT * FROM products';
    const result = await pool.query(query);
    return result.rows;
};

const getProductById = async (id_product) => {
    const query = 'SELECT * FROM products WHERE id_product = $1';
    const values = [id_product];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateProductById = async (id_product, id_user, product_name, product_price, categories) => {
    const query = 'UPDATE products SET id_user = $1, product_name = $2, product_price = $3, categories = $4 WHERE id_product = $5 RETURNING *';
    const values = [id_user, product_name, product_price, categories, id_product];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteProductById = async (id_product) => {
    const query = 'DELETE FROM products WHERE id_product = $1 RETURNING *';
    const values = [id_product];
    const result = await pool.query(query, values);
    return result.rows[0];
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};