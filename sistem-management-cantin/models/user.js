const pool = require('../config/db');

const createUser= async(email, password, name, role)=>{
    const query = 'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [email, password, name, role];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllUsers = async () => {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    return result.rows;
};

const getUserById = async (id_user) => {
    const query = 'SELECT * FROM users WHERE id_user = $1';
    const values = [id_user];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateUserById = async (id_user, email, password, name, role) => {
    const query = 'UPDATE users SET email = $1, password = $2, name = $3, role = $4 WHERE id_user = $5 RETURNING *';
    const values = [email, password, name, role, id_user];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteUserById = async (id_user) => {
    const query = 'DELETE FROM users WHERE id_user = $1 RETURNING *';
    const values = [id_user];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserByEmail,
};
