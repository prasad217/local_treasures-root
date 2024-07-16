const { pool } = require('../config/dbConfig');

const findByEmail = async (email) => {
  const [rows] = await pool.query('CALL findByEmail(?)', [email]);
  return rows[0];
};

const createUser = async (username, email, hashedPassword) => {
  await pool.execute('CALL createUser(?, ?, ?)', [username, email, hashedPassword]);
};

const getUserById = async (userId) => {
  const [rows] = await pool.query('CALL getUserById(?)', [userId]);
  return rows[0];
};

module.exports = {
  findByEmail,
  createUser,
  getUserById
};
