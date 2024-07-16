const pool = require('../config');

const getConnection = async () => {
  return await pool.getConnection();
};

const getNextFormattedOrderId = async (connection) => {
  const query = 'CALL getNextFormattedOrderId()';
  const [result] = await connection.query(query);
  return result[0][0].formattedOrderId; // Stored procedure results are wrapped in an extra array
};

const calculateDeliveryDate = (orderDate) => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 7);
  return deliveryDate;
};

const createOrder = async (connection, userId, addressId, totalPrice, formattedOrderId, deliveryDate) => {
  const query = 'CALL createOrder(?, ?, ?, ?, ?, @orderId)';
  await connection.execute(query, [userId, addressId, totalPrice, formattedOrderId, deliveryDate]);
  const [result] = await connection.query('SELECT @orderId AS orderId');
  return result[0].orderId;
};

const createOrderItem = async (connection, orderId, productId, quantity, price) => {
  const query = 'CALL createOrderItem(?, ?, ?, ?)';
  await connection.execute(query, [orderId, productId, quantity, price]);
};

const getDealerById = async (dealerId, connection) => {
  const query = 'CALL getDealerById(?)';
  const [result] = await connection.query(query, [dealerId]);
  return result[0][0]; // Stored procedure results are wrapped in an extra array
};

module.exports = {
  getConnection,
  getNextFormattedOrderId,
  calculateDeliveryDate,
  createOrder,
  createOrderItem,
  getDealerById
};
