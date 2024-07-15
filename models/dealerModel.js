// models/dealerModel.js

const { pool } = require('../config/dbConfig');

const createDealer = async (dealer) => {
  const {
    name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry
  } = dealer;

  await pool.execute(
    'INSERT INTO dealers (name, phone, email, age, address, password, location_link, shop_name, shopGST, otp, otp_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry]
  );
};

const findDealerByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM dealers WHERE email = ?', [email]);
  return rows[0];
};

const verifyDealerOtp = async (email, otp) => {
  const [rows] = await pool.query('SELECT * FROM dealers WHERE email = ? AND otp = ?', [email, otp]);
  return rows[0];
};

const updateDealerVerificationStatus = async (email) => {
  await pool.execute('UPDATE dealers SET verified = 1 WHERE email = ?', [email]);
};

const updateDealerOtp = async (email, otp, otpExpiry) => {
  await pool.execute('UPDATE dealers SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, otpExpiry, email]);
};

const getDealerById = async (dealerId) => {
  const [rows] = await pool.query('SELECT id, name, email FROM dealers WHERE id = ?', [dealerId]);
  return rows[0];
};

module.exports = {
  createDealer,
  findDealerByEmail,
  verifyDealerOtp,
  updateDealerVerificationStatus,
  updateDealerOtp,
  getDealerById
};
