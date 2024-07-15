const OrderModel = require('../models/OrderModel');

const placeOrder = async (req, res) => {
  const { addressId, items, totalPrice } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not signed in." });
  }

  try {
    const { orderId } = await OrderModel.placeOrder(userId, addressId, totalPrice, items);
    res.json({ message: "Order placed successfully", orderId });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: "Failed to place order", detail: error.message });
  }
};

const getOrdersHistory = async (req, res) => {
  const userId = req.session.userId; // Assuming userId is stored in session

  try {
    const orders = await OrderModel.getOrderHistoryByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  placeOrder,
  getOrdersHistory,
};
