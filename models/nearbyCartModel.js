const pool = require('../config');

const getCartItemsByUserId = async (userId) => {
  const [cartItems] = await pool.query('SELECT * FROM nearby_cart_items WHERE user_id = ?', [userId]);
  return cartItems;
};

const addToCart = async (userId, productId, name, price, imageUrl, quantity, dealerId) => {
  await pool.execute(
    "INSERT INTO nearby_cart_items (user_id, product_id, name, price, image_url, quantity, dealer_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, productId, name, price, imageUrl, quantity, dealerId]
  );
};

const clearCart = async (userId) => {
  await pool.execute("DELETE FROM nearby_cart_items WHERE user_id = ?", [userId]);
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
  const [result] = await pool.execute(
    "UPDATE nearby_cart_items SET quantity = ? WHERE id = ?",
    [quantity, cartItemId]
  );
  return result;
};

const deleteCartItem = async (cartItemId) => {
  const [result] = await pool.execute("DELETE FROM nearby_cart_items WHERE id = ?", [cartItemId]);
  return result;
};

module.exports = {
  getCartItemsByUserId,
  addToCart,
  clearCart,
  updateCartItemQuantity,
  deleteCartItem
};

