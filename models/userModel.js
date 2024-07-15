// models/userModel.js

const { pool } = require('../config/dbConfig');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);
  return rows[0];
};

const createUser = async (username, email, hashedPassword) => {
  await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
};

const getUserById = async (userId) => {
  const [rows] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [userId]);
  return rows[0];
};

module.exports = {
  findByEmail,
  createUser,
  getUserById
};
