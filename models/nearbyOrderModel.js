const pool = require('../config');

const getConnection = async () => {
  return await pool.getConnection();
};

const getNextFormattedOrderId = async (connection) => {
  const [result] = await connection.query("SELECT COUNT(*) as count FROM nearby_orders");
  const count = result[0].count;
  return `ORD-${count + 1}`;
};

const calculateDeliveryDate = (orderDate) => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 7);
  return deliveryDate;
};

const createOrder = async (connection, userId, addressId, totalPrice, formattedOrderId, deliveryDate) => {
  const [result] = await connection.execute(
    "INSERT INTO nearby_orders (user_id, address_id, total_price, formatted_order_id, delivery_date) VALUES (?, ?, ?, ?, ?)",
    [userId, addressId, totalPrice, formattedOrderId, deliveryDate]
  );
  return result.insertId;
};

const createOrderItem = async (connection, orderId, productId, quantity, price) => {
  await connection.execute(
    "INSERT INTO nearby_order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [orderId, productId, quantity, price]
  );
};

const getDealerById = async (dealerId, connection) => {
  const [result] = await connection.query("SELECT * FROM dealers WHERE id = ?", [dealerId]);
  return result[0];
};

module.exports = {
  getConnection,
  getNextFormattedOrderId,
  calculateDeliveryDate,
  createOrder,
  createOrderItem,
  getDealerById
};
