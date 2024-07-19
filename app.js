require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const Redis = require('ioredis'); // Import ioredis
const RedisStore = require("connect-redis").default

const { redisClient } = require('./config/redisConfig');
const { pool } = require('./config/dbConfig');
const authController = require('./controllers/authController');
const cartController = require('./controllers/cartController');
const userController = require('./controllers/userController');
const dealerController = require('./controllers/dealerController'); 
const productController = require('./controllers/productController'); 
const orderController = require('./controllers/orderController'); 
const agentController = require('./controllers/agentController'); 
const nearbyAddressController = require('./controllers/nearbyAddressController');
const nearbyCartController = require('./controllers/nearbyCartController');
const nearbyOrderController = require('./controllers/nearbyOrderController');


const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/Users/prasad/Desktop/main project/local_treasures-root/server/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
app.use('/uploads', express.static('/Users/prasad/Desktop/main project/local_treasures-root/server/uploads'));

const upload = multer({ storage: storage });

app.use(session({
  store: new RedisStore({ client: redisClient }), // Initialize RedisStore correctly
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    expires: null
  }
}));

app.set('trust proxy', 1);

// Routes
app.post('/signin', authController.signin);
app.post('/register', authController.register);
app.post('/api/cart', cartController.addToCart);
app.get('/api/cart', cartController.getCartItems);
app.delete('/api/cart/:id', cartController.deleteCartItem);
app.patch('/api/cart/items/:id', cartController.updateCartItemQuantity);
app.get('/api/user/info', userController.getUserInfo);
app.post('/api/address', userController.saveUserAddress);
app.get('/api/users/addresses', userController.getUserAddresses);

// Dealer Routes
app.post('/dealer/register', dealerController.registerDealer);
app.post('/dealer/verify-otp', dealerController.verifyDealerOtp);
app.post('/dealer/signin', dealerController.dealerSignin);
app.post('/dealer/logout', dealerController.logout);
app.get('/dealer/info', dealerController.getDealerInfo);

// Product Routes
app.post('/api/dealer/addProduct', upload.single('image'), productController.addProduct);
app.get('/api/dealer/products', productController.getProductsByDealerId);
app.delete('/api/dealer/products/:productId', productController.deleteProduct);
app.get('/api/products', productController.getAllProducts);
app.get('/api/products/:productId', productController.getProductById);
app.get('/api/products/category/:categoryName', productController.getProductsByCategory);

// Orders Routes
app.post('/api/orders', orderController.placeOrder);
app.get('/api/orders/history', orderController.getOrdersHistory);

// Agent Routes
app.post('/delivery-agent/signin', agentController.signIn);
app.post('/delivery-agent/register', agentController.registerAgent);
app.post('/delivery-agent/verify-otp', agentController.verifyOTP);

app.get('/api/dealers/nearby',dealerController.getNearbyDealers);
app.get('/api/dealers/:dealerId/products', dealerController.getProductsByDealerId);
app.post('/api/nearby/cart',nearbyCartController.addToNearbyCart);
app.post('/api/nearby/cart/replace',nearbyCartController.replaceNearbyCart);
app.get('/api/nearby/cart',nearbyCartController.getNearbyCartItems);
app.patch('/api/nearby/cart/items/:id',nearbyCartController.updateNearbyCartItemQuantity);
app.delete('/api/nearby/cart/:id',nearbyCartController.deleteNearbyCartItem);
app.get('/api/user/longitude',userController.getUserAddresses);
app.post('/api/nearby/address',nearbyAddressController.addNearbyAddress);
app.get('/api/users/nearby-addresses',nearbyAddressController.getUserNearbyAddresses);
app.post('/api/nearby/orders',nearbyOrderController.createNearbyOrder);




// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
