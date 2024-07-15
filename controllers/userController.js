// controllers/userController.js

const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');

const getUserInfo = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await userModel.getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const saveUserAddress = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const { name, door_no, address_lane, landmark, pincode, city, state, phonenumber } = req.body;

  try {
    await addressModel.saveOrUpdateAddress(userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber);

    const addresses = await addressModel.getAddressByUserId(userId);
    
    if (addresses.length > 0) {
      res.json(addresses[0]);
    } else {
      res.status(404).json({ message: 'Address not found after saving.' });
    }
  } catch (error) {
    console.error('Error saving or fetching user address:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserAddresses = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const addresses = await addressModel.getAddressByUserId(userId);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserInfo,
  saveUserAddress,
  getUserAddresses
};
