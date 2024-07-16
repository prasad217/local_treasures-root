const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const signIn = async (email, password) => {
  try {
    const query = 'CALL signIn(?)';
    const [agents] = await pool.query(query, [email]);

    if (agents.length > 0) {
      const agent = agents[0];

      // Compare the hashed password
      const match = await bcrypt.compare(password, agent.password);
      return match ? { success: true, agent } : { success: false, message: 'Invalid credentials' };
    } else {
      return { success: false, message: 'Agent not found' };
    }
  } catch (error) {
    throw error;
  }
};

const registerAgent = async (name, phone, dob, email, address, vehicle_number, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    const otp_expiry = new Date();
    otp_expiry.setMinutes(otp_expiry.getMinutes() + 10); // OTP expires in 10 minutes

    const query = 'CALL registerAgent(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.query(query, [name, phone, dob, email, address, vehicle_number, otp, otp_expiry, hashedPassword]);

    return { success: true, otp, email };
  } catch (error) {
    throw error;
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const query = 'CALL verifyOTP(?, ?)';
    const [results] = await pool.query(query, [email, otp]);

    if (results.length === 0) {
      return { success: false, message: 'Invalid OTP or OTP expired' };
    }

    const updateQuery = 'CALL updateEmailVerified(?)';
    await pool.query(updateQuery, [email]);

    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signIn,
  registerAgent,
  verifyOTP
};
