const {Pool}=require('pg');
require('dotenv').config();

const pool=new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
});

const createTable = async () => {
    try {
        //users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id_user SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) CHECK (role IN ('SUPER_ADMIN', 'ADMIN')) NOT NULL
            )
        `);

        //products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id_product SERIAL PRIMARY KEY,
                id_user INTEGER REFERENCES users(id_user),
                product_name VARCHAR(255) NOT NULL,
                product_price BIGINT NOT NULL,
                categories VARCHAR(255) CHECK (categories IN ('FOODS', 'DRINKS')) NOT NULL
            )
        `);

        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

module.exports={
    pool,
    createTable,
};