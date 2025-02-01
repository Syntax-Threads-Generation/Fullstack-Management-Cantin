const { pool} = require('../config/db')

const createProduct = async (id_user, product_name, product_price, categories) => {  
    const query = `  
        INSERT INTO products (id_user, product_name, product_price, categories)   
        VALUES ($1, $2, $3, $4)   
        RETURNING *;  
    `;  
    const values = [id_user, product_name, product_price, categories];  
    const productResult = await pool.query(query, values);  
  
    const product = productResult.rows[0];  
  
    const userQuery = `  
        SELECT id_user, email, name   
        FROM users   
        WHERE id_user = $1;  
    `;  
    const userResult = await pool.query(userQuery, [product.id_user]);  
    const user = userResult.rows[0];  
  
    return {  
        ...product,  
        user: user,  
    };  
};  

const getAllProducts = async (page, limit) => {   
    const offset = (page - 1) * limit;   
    const query = `    
        SELECT p.*, u.id_user, u.email, u.name     
        FROM products p     
        JOIN users u ON p.id_user = u.id_user  
        ORDER BY p.product_price ASC  
        LIMIT $1  
        OFFSET $2;    
    `;  
    const countQuery = `    
        SELECT COUNT(*) AS total_products    
        FROM products;    
    `;  
      
    try {  
        const productResult = await pool.query(query, [limit, offset]);  
        const countResult = await pool.query(countQuery);  
          
        if (productResult.rows.length === 0) {  
            return {  
                products: [],  
                totalProducts: 0,  
            };  
        }  
  
        return {  
            products: productResult.rows,  
            totalProducts: parseInt(countResult.rows[0].total_products, 10),  
        };  
    } catch (error) {  
        console.error('Error fetching products:', error);  
        throw new Error('Database query failed');  
    }  
};  
 
  
const getProductById = async (id_product) => {  
    const query = `  
        SELECT p.*, u.id_user, u.email, u.name   
        FROM products p   
        JOIN users u ON p.id_user = u.id_user   
        WHERE p.id_product = $1;  
    `;  
    const values = [id_product];  
    const result = await pool.query(query, values);  
    return result.rows[0];  
};  
  
const updateProductById = async (id_product, id_user, product_name, product_price, categories) => {  
    const query = `  
        UPDATE products   
        SET id_user = $1, product_name = $2, product_price = $3, categories = $4   
        WHERE id_product = $5   
        RETURNING *;  
    `;  
    const values = [id_user, product_name, product_price, categories, id_product];  
    const productResult = await pool.query(query, values);  
  
    const product = productResult.rows[0];  
  
    // Ambil informasi pengguna berdasarkan id_user  
    const userQuery = `  
        SELECT id_user, email, name   
        FROM users   
        WHERE id_user = $1;  
    `;  
    const userResult = await pool.query(userQuery, [product.id_user]);  
    const user = userResult.rows[0];  
  
    // Gabungkan informasi produk dan pengguna  
    return {  
        ...product,  
        user: user,  
    };  
};  
  
const deleteProductById = async (id_product) => {  
    const query = `  
        DELETE FROM products   
        WHERE id_product = $1   
        RETURNING *;  
    `;  
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