// models/cartModel.js

const { pool } = require('../config/dbConfig');

const addCartItem = async (userId, productId, name, discount_price, image_url) => {
  await pool.execute(
    "INSERT INTO cart_items (user_id, product_id, name, price, image_url) VALUES (?, ?, ?, ?, ?)",
    [userId, productId, name, discount_price, image_url]
  );
};

const getCartItemsByUserId = async (userId) => {
  const [rows] = await pool.query("SELECT * FROM cart_items WHERE user_id = ?", [userId]);
  return rows;
};

const deleteCartItemById = async (productId) => {
  const [result] = await pool.execute("DELETE FROM cart_items WHERE id = ?", [productId]);
  return result;
};

const updateCartItemQuantityById = async (productId, quantity) => {
  const [result] = await pool.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, productId]);
  return result;
};

module.exports = {
  addCartItem,
  getCartItemsByUserId,
  deleteCartItemById,
  updateCartItemQuantityById
};
