const pool = require('../config');

const addAddress = async (userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber) => {
  await pool.execute(
    "INSERT INTO nearby_addresses (user_id, name, door_no, address_lane, landmark, pincode, city, state, phonenumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]
  );
};

const getUserAddresses = async (userId, pincode) => {
  const [addresses] = await pool.query(
    "SELECT * FROM nearby_addresses WHERE user_id = ? AND pincode = ?",
    [userId, pincode]
  );
  return addresses;
};

module.exports = {
  addAddress,
  getUserAddresses
};
