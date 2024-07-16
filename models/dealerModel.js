const { pool } = require('../config/dbConfig');

const createDealer = async (dealer) => {
  const {
    name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry
  } = dealer;

  const query = 'CALL createDealer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  await pool.execute(query, [name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry]);
};

const findDealerByEmail = async (email) => {
  const query = 'CALL findDealerByEmail(?)';
  const [rows] = await pool.query(query, [email]);
  return rows[0][0]; // Stored procedure results are wrapped in an extra array
};

const verifyDealerOtp = async (email, otp) => {
  const query = 'CALL verifyDealerOtp(?, ?)';
  const [rows] = await pool.query(query, [email, otp]);
  return rows[0][0]; // Stored procedure results are wrapped in an extra array
};

const updateDealerVerificationStatus = async (email) => {
  const query = 'CALL updateDealerVerificationStatus(?)';
  await pool.execute(query, [email]);
};

const updateDealerOtp = async (email, otp, otpExpiry) => {
  const query = 'CALL updateDealerOtp(?, ?, ?)';
  await pool.execute(query, [email, otp, otpExpiry]);
};

const getDealerById = async (dealerId) => {
  const query = 'CALL getDealerById(?)';
  const [rows] = await pool.query(query, [dealerId]);
  return rows[0][0]; // Stored procedure results are wrapped in an extra array
};

module.exports = {
  createDealer,
  findDealerByEmail,
  verifyDealerOtp,
  updateDealerVerificationStatus,
  updateDealerOtp,
  getDealerById
};
