const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmailToDealer(email, product, quantity) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Order Notification',
      text: `You have a new order for the following item: ${product.name} (Quantity: ${quantity}). Please prepare it for shipment.`,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

module.exports = { sendEmailToDealer };
