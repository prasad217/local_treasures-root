const nearbyCartModel = require('../models/nearbyCartModel');
const productModel = require('../models/productModel');

const addToNearbyCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in. Please sign in to add products to the nearby cart." });
  }

  try {
    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url, dealer_id } = product;
    const currentCart = await nearbyCartModel.getCartItemsByUserId(userId);

    if (currentCart.length > 0 && currentCart[0].dealer_id !== dealer_id) {
      return res.status(409).json({
        error: "Nearby cart contains items from a different dealer.",
        actionRequired: "replace" 
      });
    }

    await nearbyCartModel.addToCart(userId, productId, name, discount_price, image_url, quantity, dealer_id);

    res.json({ message: "Product added to nearby cart successfully" });
  } catch (error) {
    console.error("Error adding product to nearby cart:", error);
    res.status(500).json({ error: "Failed to add product to nearby cart", detail: error.message });
  }
};

const replaceNearbyCart = async (req, res) => {
  const { productId, quantity, dealerId } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    await nearbyCartModel.clearCart(userId);
    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url } = product;
    await nearbyCartModel.addToCart(userId, productId, name, discount_price, image_url, quantity, dealerId);

    res.json({ message: "Nearby cart replaced and new product added successfully" });
  } catch (error) {
    console.error("Error replacing nearby cart:", error);
    res.status(500).json({ error: "Failed to replace nearby cart", detail: error.message });
  }
};

const getNearbyCartItems = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    const cartItems = await nearbyCartModel.getCartItemsByUserId(userId);
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching nearby cart items:", error);
    res.status(500).json({ error: "Failed to fetch nearby cart items" });
  }
};

const updateNearbyCartItemQuantity = async (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.id;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity not provided" });
  }

  try {
    const result = await nearbyCartModel.updateCartItemQuantity(cartItemId, quantity);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nearby cart item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error updating nearby cart item quantity:", error);
    res.status(500).json({ error: "Failed to update nearby cart item quantity" });
  }
};

const deleteNearbyCartItem = async (req, res) => {
  const cartItemId = req.params.id;

  try {
    const result = await nearbyCartModel.deleteCartItem(cartItemId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nearby cart item not found or already deleted" });
    }

    res.status(200).json({ message: "Nearby cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting nearby cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addToNearbyCart,
  replaceNearbyCart,
  getNearbyCartItems,
  updateNearbyCartItemQuantity,
  deleteNearbyCartItem
};
