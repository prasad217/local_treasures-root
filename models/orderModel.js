const { pool } = require('../config/dbConfig');
const transporter = require('../config/emailConfig'); // Assuming email configuration is in emailConfig.js

const placeOrder = async (userId, addressId, totalPrice, items) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query('INSERT INTO orders (user_id, address_id, total_price) VALUES (?, ?, ?)', [userId, addressId, totalPrice]);
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [productRows] = await connection.query('SELECT * FROM products WHERE id = ?', [item.productId]);

      if (productRows.length > 0) {
        const product = productRows[0];

        if (product.instockqty >= item.quantity) {
          const newStock = product.instockqty - item.quantity;
          await connection.query('UPDATE products SET instockqty = ? WHERE id = ?', [newStock, item.productId]);

          await connection.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)', [orderId, item.productId, item.quantity]);

          // Sending email to dealer
          const dealerId = product.dealer_id;
          const [dealerRows] = await connection.query('SELECT email FROM dealers WHERE id = ?', [dealerId]);
          if (dealerRows.length > 0) {
            const dealerEmail = dealerRows[0].email;
            await sendEmailToDealer(dealerEmail, product.name, item.quantity);
          }

        } else {
          throw new Error(`Not enough stock for product ID ${item.productId}`);
        }
      } else {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    await connection.commit();
    return { orderId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

async function sendEmailToDealer(email, productName, quantity) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Order Received',
    text: `You have received a new order for ${quantity} unit(s) of ${productName}. Please check your dashboard for details.`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const getOrderHistoryByUserId = async (userId) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      return { ...order, items };
    }));

    return ordersWithItems;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  placeOrder,
  getOrderHistoryByUserId,
};
