// controllers/cartController.js

const { pool } = require('../config/dbConfig');

const addToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId; // Retrieve userId from session

  if (!userId) {
    return res.status(401).json({
      error: "User is not signed in. Please sign in to add products to the cart.",
    });
  }

  try {
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);

    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url } = productRows[0];

    await pool.execute(
      "INSERT INTO cart_items (user_id, product_id, name, price, image_url) VALUES (?, ?, ?, ?, ?)",
      [userId, productId, name, discount_price, image_url]
    );

    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Failed to add product to cart", detail: error.message });
  }
};

const getCartItems = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM cart_items WHERE user_id = ?", [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

const deleteCartItem = async (req, res) => {
  const productId = req.params.id;

  try {
    const [result] = await pool.execute("DELETE FROM cart_items WHERE id = ?", [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found or already deleted" });
    }

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateCartItemQuantity = async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity not provided" });
  }

  try {
    const [result] = await pool.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Failed to update cart item quantity" });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  deleteCartItem,
  updateCartItemQuantity
};
