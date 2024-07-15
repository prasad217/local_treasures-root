const agentModel = require('../models/agentModel');
const transporter = require('../config/emailConfig'); // Assuming you have configured nodemailer

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { success, agent, message } = await agentModel.signIn(email, password);

    if (success) {
      req.session.agentId = agent.id; // Or use JWT for session management
      res.json({ message: 'Sign-in successful', agentName: agent.name });
    } else {
      res.status(401).json({ message });
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error during sign-in' });
  }
};

const registerAgent = async (req, res) => {
  const { name, phone, dob, email, address, vehicle_number, password } = req.body;

  try {
    const { success, otp, email: agentEmail } = await agentModel.registerAgent(name, phone, dob, email, address, vehicle_number, password);

    if (success) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: agentEmail,
        subject: 'Verify Your Email',
        text: `Your OTP is ${otp}. It expires in 10 minutes.`
      };

      let info = await transporter.sendMail(mailOptions);
      console.log('OTP Email sent:', info.response);
      res.json({ message: 'Registered successfully. Please check your email for the OTP.', success: true });
    } else {
      res.status(500).json({ message: 'Error during registration. Please try again later.', success: false });
    }
  } catch (error) {
    console.error('Error in registration or sending OTP email:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { success, message } = await agentModel.verifyOTP(email, otp);

    if (success) {
      res.json({ message: 'Email verified successfully' });
    } else {
      res.status(401).json({ message });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

module.exports = {
  signIn,
  registerAgent,
  verifyOTP
};
