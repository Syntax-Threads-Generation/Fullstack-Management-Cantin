const { pool } = require("../config/db");

const createInventory = async (
  id_user,
  inventory_name,
  inventory_price_unit,
  inventory_quantity,
  inventory_discount,
  inventory_price_discount,
  inventory_total_price,
  date_inventory_buy,
  category
) => {
  const query = `
        INSERT INTO inventory (id_user, inventory_name, inventory_price_unit, inventory_quantity, inventory_discount, inventory_price_discount, inventory_total_price, date_inventory_buy, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
  const values = [
    id_user,
    inventory_name,
    inventory_price_unit,
    inventory_quantity,
    inventory_discount,
    inventory_price_discount,
    inventory_total_price,
    date_inventory_buy,
    category,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllInventory = async () => {
  const query = "SELECT * FROM inventory";
  const result = await pool.query(query);
  return result.rows;
};

const getInventoryById = async (id_inventory) => {
  const query = "SELECT * FROM inventory WHERE id_inventory = $1";
  const values = [id_inventory];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateInventory = async (
  id_inventory,
  inventory_name,
  inventory_price_unit,
  inventory_quantity,
  inventory_discount,
  inventory_price_discount,
  inventory_total_price,
  date_inventory_buy,
  category
) => {
  const query = `
        UPDATE inventory SET inventory_name = $1, inventory_price_unit = $2, inventory_quantity = $3, inventory_discount = $4, inventory_price_discount = $5, inventory_total_price = $6, date_inventory_buy = $7, category = $8
        WHERE id_inventory = $9
        RETURNING *;
    `;
  const values = [
    inventory_name,
    inventory_price_unit,
    inventory_quantity,
    inventory_discount,
    inventory_price_discount,
    inventory_total_price,
    date_inventory_buy,
    category,
    id_inventory,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const inventoryByDate = async (date_inventory_buy) => {
  const query = "SELECT * FROM inventory WHERE date_inventory_buy = $1";
  const values = [date_inventory_buy];
  const result = await pool.query(query, values);
  return result.rows;
};

const inventoryByCategory = async (category) => {
  const query = "SELECT * FROM inventory WHERE category = $1";
  const values = [category];
  const result = await pool.query(query, values);
  return result.rows;
};

const deleteInventory = async (id_inventory) => {
  const query = "DELETE FROM inventory WHERE id_inventory = $1 RETURNING *";
  const values = [id_inventory];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  inventoryByDate,
  inventoryByCategory,
  deleteInventory,
};
