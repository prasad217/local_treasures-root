// models/addressModel.js

const { pool } = require('../config/dbConfig');

const saveOrUpdateAddress = async (userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber) => {
  const query = `
    INSERT INTO user_addresses (user_id, name, door_no, address_lane, landmark, pincode, city, state, phonenumber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name=VALUES(name), door_no=VALUES(door_no), address_lane=VALUES(address_lane), 
                            landmark=VALUES(landmark), pincode=VALUES(pincode), city=VALUES(city), 
                            state=VALUES(state), phonenumber=VALUES(phonenumber)`;

  await pool.execute(query, [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]);
};

const getAddressByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM user_addresses WHERE user_id = ?', [userId]);
  return rows;
};

module.exports = {
  saveOrUpdateAddress,
  getAddressByUserId
};
