const nearbyAddressModel = require('../models/nearbyAddressModel');

const addNearbyAddress = async (req, res) => {
  const { name, door_no, address_lane, landmark, pincode, city, state, phonenumber } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    await nearbyAddressModel.addAddress(userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber);
    res.json({ message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ error: "Failed to add address" });
  }
};

const getUserNearbyAddresses = async (req, res) => {
  const userId = req.session.userId;
  const { pincode } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const addresses = await nearbyAddressModel.getUserAddresses(userId, pincode);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching nearby addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addNearbyAddress,
  getUserNearbyAddresses
};
