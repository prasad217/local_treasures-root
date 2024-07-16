const { pool } = require('../config/dbConfig');

const addCartItem = async (userId, productId, name, discount_price, image_url) => {
  const query = 'CALL addCartItem(?, ?, ?, ?, ?)';
  await pool.execute(query, [userId, productId, name, discount_price, image_url]);
};

const getCartItemsByUserId = async (userId) => {
  const query = 'CALL getCartItemsByUserId(?)';
  const [rows] = await pool.query(query, [userId]);
  return rows[0]; // Stored procedure results are wrapped in an extra array
};

const deleteCartItemById = async (productId) => {
  const query = 'CALL deleteCartItemById(?)';
  const [result] = await pool.execute(query, [productId]);
  return result;
};

const updateCartItemQuantityById = async (productId, quantity) => {
  const query = 'CALL updateCartItemQuantityById(?, ?)';
  const [result] = await pool.execute(query, [productId, quantity]);
  return result;
};

module.exports = {
  addCartItem,
  getCartItemsByUserId,
  deleteCartItemById,
  updateCartItemQuantityById
};
