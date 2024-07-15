// controllers/dealerController.js

const bcrypt = require('bcryptjs');
const dealerModel = require('../models/dealerModel');
const transporter = require('../config/nodemailerConfig'); // Assuming you have this config file
const { calculateDistance, extractLatLng } = require('../utils');

const registerDealer = async (req, res) => {
  const { name, phone, email, password, age, address, locationLink, shopName, shopGST } = req.body;

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    await dealerModel.createDealer({
      name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Registered successfully. Please check your email for the OTP.' });
  } catch (error) {
    console.error('Error registering dealer:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyDealerOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP must be provided' });
  }

  try {
    const dealer = await dealerModel.verifyDealerOtp(email, otp);

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found or invalid OTP' });
    }

    const currentDateTime = new Date();
    if (currentDateTime > new Date(dealer.otp_expiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    await dealerModel.updateDealerVerificationStatus(email);
    res.json({ message: 'OTP verification successful' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const dealerSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const dealer = await dealerModel.findDealerByEmail(email);

    if (!dealer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!dealer.verified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      await dealerModel.updateDealerOtp(email, otp, otpExpiry);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}. It is valid for the next 10 minutes only.`
      };

      await transporter.sendMail(mailOptions);

      return res.status(403).json({ error: 'Account not verified. We have sent a new OTP to your email.', resendOTP: true });
    }

    if (await bcrypt.compare(password, dealer.password)) {
      req.session.dealerId = dealer.id;
      res.json({ message: 'Sign-in successful' });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during dealer sign-in:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('dealerId');
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.send({ message: 'Logout successful' });
  });
};

const getDealerInfo = async (req, res) => {
  if (!req.session.dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const dealer = await dealerModel.getDealerById(req.session.dealerId);
    if (dealer) {
      res.json(dealer);
    } else {
      res.status(404).json({ message: 'Dealer not found' });
    }
  } catch (error) {
    console.error('Error fetching dealer info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNearbyDealers = async (req, res) => {
  const userLatitude = parseFloat(req.query.latitude);
  const userLongitude = parseFloat(req.query.longitude);

  if (!userLatitude || !userLongitude) {
    return res.status(400).json({ error: 'Please provide latitude and longitude' });
  }

  try {
    const dealers = await dealerModel.getAllDealers();
    const dealersWithDistance = dealers.map(dealer => {
      const { latitude, longitude } = extractLatLng(dealer.location_link);
      const distance = calculateDistance(userLatitude, userLongitude, latitude, longitude);
      return { ...dealer, distance };
    }).filter(dealer => dealer.distance !== undefined)
      .sort((a, b) => a.distance - b.distance);

    res.json(dealersWithDistance);
  } catch (error) {
    console.error('Error fetching nearby dealers:', error);
    res.status(500).json({ error: 'Failed to fetch nearby dealers' });
  }
};

const getProductsByDealerId = async (req, res) => {
  const { dealerId } = req.params;

  try {
    const products = await dealerModel.getProductsByDealerId(dealerId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching dealer\'s products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  registerDealer,
  verifyDealerOtp,
  dealerSignin,
  logout,
  getDealerInfo,
  getNearbyDealers,
  getProductsByDealerId
};
