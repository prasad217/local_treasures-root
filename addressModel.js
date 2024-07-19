const { pool } = require('../config/dbConfig');

const saveOrUpdateAddress = async (userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber) => {
  const query = 'CALL saveOrUpdateAddress(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  await pool.execute(query, [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]);
};

const getAddressByUserId = async (userId) => {
  const [rows] = await pool.query('CALL getAddressByUserId(?)', [userId]);
  return rows[0]; // Stored procedure results are wrapped in an extra array
};

module.exports = {
  saveOrUpdateAddress,
  getAddressByUserId
};
