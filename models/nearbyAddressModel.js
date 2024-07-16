const pool = require('../config');

const addAddress = async (userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber) => {
  const query = 'CALL addAddress(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  await pool.execute(query, [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]);
};

const getUserAddresses = async (userId, pincode) => {
  const query = 'CALL getUserAddresses(?, ?)';
  const [addresses] = await pool.query(query, [userId, pincode]);
  return addresses[0]; // Stored procedure results are wrapped in an extra array
};

module.exports = {
  addAddress,
  getUserAddresses
};
