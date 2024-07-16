const pool = require('../config');

const getCartItemsByUserId = async (userId) => {
  const query = 'CALL getCartItemsByUserId(?)';
  const [cartItems] = await pool.query(query, [userId]);
  return cartItems[0]; // Stored procedure results are wrapped in an extra array
};

const addToCart = async (userId, productId, name, price, imageUrl, quantity, dealerId) => {
  const query = 'CALL addToCart(?, ?, ?, ?, ?, ?, ?)';
  await pool.execute(query, [userId, productId, name, price, imageUrl, quantity, dealerId]);
};

const clearCart = async (userId) => {
  const query = 'CALL clearCart(?)';
  await pool.execute(query, [userId]);
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
  const query = 'CALL updateCartItemQuantity(?, ?)';
  const [result] = await pool.execute(query, [quantity, cartItemId]);
  return result;
};

const deleteCartItem = async (cartItemId) => {
  const query = 'CALL deleteCartItem(?)';
  const [result] = await pool.execute(query, [cartItemId]);
  return result;
};

module.exports = {
  getCartItemsByUserId,
  addToCart,
  clearCart,
  updateCartItemQuantity,
  deleteCartItem
};
