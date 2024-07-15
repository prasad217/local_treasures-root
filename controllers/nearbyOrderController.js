const nearbyOrderModel = require('../models/nearbyOrderModel');
const productModel = require('../models/productModel');
const { sendEmailToDealer } = require('../utils/email');

const createNearbyOrder = async (req, res) => {
  const { addressId, items, totalPrice } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not signed in." });
  }

  const connection = await nearbyOrderModel.getConnection();
  try {
    await connection.beginTransaction();

    const formattedOrderId = await nearbyOrderModel.getNextFormattedOrderId(connection);
    const deliveryDate = nearbyOrderModel.calculateDeliveryDate(new Date());

    const orderId = await nearbyOrderModel.createOrder(connection, userId, addressId, totalPrice, formattedOrderId, deliveryDate);

    for (const item of items) {
      const product = await productModel.getProductById(item.productId, connection);
      if (!product || product.instockqty < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }

      await productModel.updateProductStock(connection, item.productId, product.instockqty - item.quantity);
      await nearbyOrderModel.createOrderItem(connection, orderId, item.productId, item.quantity, product.discount_price);

      const dealer = await nearbyOrderModel.getDealerById(product.dealer_id, connection);
      if (dealer) {
        sendEmailToDealer(dealer.email, product.name, item.quantity);
      }
    }

    await connection.commit();
    res.json({ message: "Nearby order created successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating nearby order:", error);
    res.status(500).json({ error: "Failed to create nearby order", detail: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  createNearbyOrder
};
