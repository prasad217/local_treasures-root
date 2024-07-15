// controllers/authController.js

const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.json({ userId: user.id, message: 'User sign-in successful' });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await userModel.createUser(username, email, hashedPassword);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signin,
  register
};

