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
const RedisStore = require("connect-redis").default;

const saltRounds = 10; // Recommended value
const app = express();
const port = process.env.PORT || 3001; // Use environment variable for port

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

const dbOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'happy'
};

const pool = mysql.createPool(dbOptions);

// Create Redis client configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Consider setting to true in production with HTTPS
    sameSite: 'lax',
    expires: null
  }
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.set('trust proxy', 1);

//user backend
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute('CALL userSignIn(?)', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0][0];
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
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.execute('CALL user_register(?, ?, ?)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/cart', async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId; // Retrieve userId from session

  // Check if user is signed in
  if (!userId) {
    return res.status(401).json({
      error: "User is not signed in. Please sign in to add products to the cart.",
    });
  }

  try {
    // Retrieve product details from the database
    const [productRows] = await pool.execute('CALL product_get_by_id(?)', [productId]);

    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url } = productRows[0];

    // Add the product to the cart in the database
    await pool.execute(
      "CALL cart_item_add(?, ?, ?, ?, ?)",
      [userId, productId, name, discount_price, image_url]
    );

    console.log("Product added to cart successfully");
    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Failed to add product to cart", detail: error.message });
  }
});

// Route to fetch cart items
app.get('/api/cart', async (req, res) => {
  const userId = req.session.userId; // Retrieve userId from session

  console.log("Session Info:", req.session); // Debugging: Log session info

  // Check if userId exists in the session
  if (!userId) {
    console.error("User ID not found in session"); // Log for debugging
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    // Retrieve cart items for the logged-in user from the database
    const [rows] = await pool.execute('CALL cart_items_get_by_user_id(?)', [userId]);

    console.log("Cart Items Fetched:", rows); // Debugging: Log fetched cart items

    // Send the retrieved cart items as a JSON response
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  const productId = req.params.id;
  console.log(`Attempting to delete product with ID: ${productId}`); // Debugging log

  try {
    const [result] = await pool.execute('CALL cart_item_delete_by_id(?)', [productId]);
    console.log("Deletion result:", result); // Log result to debug

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found or already deleted" });
    }

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to update the quantity of a cart item by its ID
app.patch("/api/cart/items/:id", async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity not provided" });
  }

  try {
    const [result] = await pool.execute("CALL updateCartItemQuantityById(?, ?)", [productId, quantity]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Failed to update cart item quantity" });
  }
});

// Route to fetch user info
app.get('/api/user/info', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [rows] = await pool.execute("CALL getUserById(?)", [userId]);

    if (rows.length > 0) {
      res.json(rows[0]); // Send back the user's information
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to save or update user address
app.post('/api/address', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const { name, door_no, address_lane, landmark, pincode, city, state, phonenumber } = req.body;

  try {
    await pool.execute("CALL saveOrUpdateAddress(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]);

    const [rows] = await pool.execute('SELECT * FROM user_addresses WHERE user_id = ?', [userId]);

    if (rows.length > 0) {
      res.json(rows[0]); // Send back the user's address information
    } else {
      res.status(404).json({ message: 'Address not found after saving.' });
    }
  } catch (error) {
    console.error('Error saving or fetching user address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to register a dealer
app.post('/dealer/register', async (req, res) => {
  const { name, phone, email, password, age, address, locationLink, shopName, shopGST } = req.body;

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    await pool.execute(
      'CALL registerDealer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email, age, address, hashedPassword, locationLink, shopName, shopGST, otp, otpExpiry]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent to: ${email}`);
    res.json({ message: 'Registered successfully. Please check your email for the OTP.' });
  } catch (error) {
    console.error('Error registering dealer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to handle OTP verification for dealer
app.post('/dealer/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP must be provided' });
  }

  try {
    const [results] = await pool.execute('CALL verifyDealerOTP(?)', [email]);
    const dealer = results[0];

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    if (dealer.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const currentDateTime = new Date();
    if (currentDateTime > new Date(dealer.otp_expiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    await pool.execute('CALL updateDealerVerification(?)', [email]);

    res.json({ message: 'OTP verification successful' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to handle dealer sign-in
app.post('/dealer/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('CALL signinDealer(?)', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const dealer = rows[0];

    if (!dealer.verified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      await pool.execute('CALL updateDealerOTP(?, ?, ?)', [otp, otpExpiry, email]);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}. It is valid for the next 10 minutes only.`
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP Email sent successfully to ${email}`);

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
});

// Route to fetch user addresses
app.get('/api/users/addresses', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [addresses] = await pool.execute('CALL getUserAddresses(?)', [userId]);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to log out
app.post('/logout', (req, res) => {
  res.clearCookie('session_cookie_name');
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.send({ message: 'Logout successful' });
  });
});

app.get('/dealer/info', async (req, res) => {
  if (!req.session.dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [rows] = await pool.execute('CALL getDealerById(?)', [req.session.dealerId]);

    if (rows.length > 0) {
      res.json(rows[0]); // Send back the dealer's information
    } else {
      res.status(404).json({ message: 'Dealer not found' });
    }
  } catch (error) {
    console.error('Error fetching dealer info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/dealer/addProduct', upload.single('image'), async (req, res) => {
  console.log('Form data:', req.body);
  console.log('File:', req.file);

  let { name, description, actualCost, discountPrice, instockqty, category, imageType, imageUrlInput } = req.body;

  actualCost = parseFloat(actualCost);
  discountPrice = parseFloat(discountPrice);
  instockqty = parseInt(instockqty, 10);

  description = description || ''; // Fallback for description
  const dealerId = req.session.dealerId;

  let imageUrl = '';
  if (imageType === 'upload' && req.file) {
    imageUrl = req.file.path; // Path where the uploaded image is saved
  } else if (imageType === 'url') {
    imageUrl = imageUrlInput; // Directly use the URL provided by the user
  }

  if (!dealerId || !name || isNaN(actualCost) || isNaN(discountPrice) || isNaN(instockqty) || !category) {
    console.error('Missing or invalid fields', {
      dealerId, name, actualCost, discountPrice, instockqty, category
    });
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const query = 'CALL addProduct(?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category];
    await pool.execute(query, params);

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.get('/dealer/products', async (req, res) => {
  const dealerId = req.session.dealerId;

  if (!dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [rows] = await pool.execute('CALL getProductsByDealerId(?)', [dealerId]);

    if (rows.length > 0) {
      res.json(rows); // Send back the dealer's products
    } else {
      res.status(404).json({ message: 'No products found for this dealer' });
    }
  } catch (error) {
    console.error('Error fetching dealer products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.delete('/dealer/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const [result] = await pool.execute('CALL deleteProductById(?)', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { addressId, items, totalPrice } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not signed in.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.execute('CALL createOrder(?, ?, ?)', [userId, addressId, totalPrice]);
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [productRows] = await connection.execute('CALL getProductById(?)', [item.productId]);

      if (productRows.length > 0) {
        const product = productRows[0];

        if (product.instockqty >= item.quantity) {
          const newStock = product.instockqty - item.quantity;
          await connection.execute('CALL updateProductStock(?, ?)', [item.productId, newStock]);
          await connection.execute('CALL addOrderItem(?, ?, ?)', [orderId, item.productId, item.quantity]);

          const [dealerRows] = await connection.execute('CALL getDealerById(?)', [product.dealer_id]);
          if (dealerRows.length > 0) {
            const dealerEmail = dealerRows[0].email;
            await sendEmailToDealer(dealerEmail, product, item.quantity); // Assuming you have defined sendEmailToDealer function
          }

        } else {
          throw new Error(`Not enough stock for product ID ${item.productId}`);
        }
      } else {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
    }

    await connection.execute('CALL clearCart(?)', [userId]);
    await connection.commit();
    res.json({ message: 'Order placed successfully', orderId: orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order', detail: error.message });
  } finally {
    connection.release();
  }
});

// Fetch orders for a dealer
app.get('/dealer/orders', async (req, res) => {
  const dealerId = req.session.dealerId;
  if (!dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [orders] = await pool.execute('CALL getOrdersByDealerId(?)', [dealerId]);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching dealer orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL getAllProducts()');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all items
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL getAllItems()');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch products by category
app.get('/api/products/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  try {
    const [products] = await pool.execute('CALL getProductsByCategory(?)', [categoryName]);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).send('No products found for this category');
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).send('Server error');
  }
});

// Fetch product by ID
app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const [product] = await pool.execute('CALL getProductById(?)', [productId]);
    if (product.length > 0) {
      res.json(product[0]);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

// Sign in delivery agent
app.post('/delivery-agent/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [agents] = await pool.execute('CALL findAgentByEmail(?)', [email]);

    if (agents.length > 0) {
      const agent = agents[0];
      const match = await bcrypt.compare(password, agent.password);
      if (match) {
        req.session.agentId = agent.id;
        return res.json({ message: 'Sign-in successful', agentName: agent.name });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      return res.status(404).json({ message: 'Agent not found' });
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error during sign-in' });
  }
});

// Register delivery agent
app.post('/delivery-agent/register', async (req, res) => {
  const { name, phone, dob, email, address, vehicle_number, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otp_expiry = new Date();
  otp_expiry.setMinutes(otp_expiry.getMinutes() + 10);

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'CALL registerAgent(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.execute(query, [name, phone, dob, email, address, vehicle_number, otp, otp_expiry, hashedPassword]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.response);
    res.json({ message: 'Registered successfully. Please check your email for the OTP.', success: true });
  } catch (error) {
    console.error('Error in registration or sending OTP email:', error);
    res.status(500).json({ message: 'Error during registration. Please try again later.', success: false });
  }
});

// Verify OTP for delivery agent registration
app.post('/delivery-agent/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const query = 'CALL verifyAgentOTP(?, ?)';
    const [results] = await pool.execute(query, [email, otp]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid OTP or OTP expired' });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Error during OTP verification. Please try again later.' });
  }
});

// Fetch nearby dealers
app.get('/api/dealers/nearby', async (req, res) => {
  const userLatitude = parseFloat(req.query.latitude);
  const userLongitude = parseFloat(req.query.longitude);

  if (!userLatitude || !userLongitude) {
    return res.status(400).json({ error: 'Please provide latitude and longitude' });
  }

  try {
    const [dealers] = await pool.execute('CALL getAllDealers()');
    const dealersWithDistance = dealers.map(dealer => {
      const { latitude, longitude } = extractLatLng(dealer.location_link);
      const distance = calculateDistance(userLatitude, userLongitude, latitude, longitude);
      return {
        ...dealer,
        distance
      };
    }).filter(dealer => dealer.distance !== undefined).sort((a, b) => a.distance - b.distance);

    res.json(dealersWithDistance);
  } catch (error) {
    console.error('Error fetching nearby dealers:', error);
    res.status(500).json({ error: 'Failed to fetch nearby dealers' });
  }
});

// Fetch products by dealer ID
app.get('/api/dealers/:dealerId/products', async (req, res) => {
  const { dealerId } = req.params;

  try {
    const [products] = await pool.execute('CALL getProductsByDealerId(?)', [dealerId]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching dealer\'s products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions
function extractLatLng(locationLink) {
  const match = locationLink.match(/q=([-\d.]+),([-\d.]+)/);
  if (match) {
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  return {};
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Fetch nearby dealers with distance calculation
app.get('/api/dealers/nearby', async (req, res) => {
  const userLatitude = parseFloat(req.query.latitude);
  const userLongitude = parseFloat(req.query.longitude);

  if (!userLatitude || !userLongitude) {
    return res.status(400).json({ error: 'Please provide latitude and longitude' });
  }

  try {
    const [dealers] = await pool.execute('CALL getAllDealers()');
    const dealersWithDistance = dealers.map(dealer => {
      const { latitude, longitude } = extractLatLng(dealer.location_link);
      const distance = calculateDistance(userLatitude, userLongitude, latitude, longitude);
      return {
        ...dealer,
        distance
      };
    }).filter(dealer => dealer.distance !== undefined).sort((a, b) => a.distance - b.distance);

    res.json(dealersWithDistance);
  } catch (error) {
    console.error('Error fetching nearby dealers:', error);
    res.status(500).json({ error: 'Failed to fetch nearby dealers' });
  }
});

function extractLatLng(locationLink) {
  const match = locationLink.match(/q=([-\d.]+),([-\d.]+)/);
  if (match) {
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  return {};
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Fetch products by dealer ID
app.get('/api/dealers/:dealerId/products', async (req, res) => {
  const { dealerId } = req.params;

  try {
    const [products] = await pool.execute('CALL getProductsByDealerId(?)', [dealerId]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching dealer\'s products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product to nearby cart
app.post('/api/nearby/cart', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      error: "User is not signed in. Please sign in to add products to the cart.",
    });
  }

  try {
    const [productRows] = await pool.execute('CALL getProductById(?)', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url, dealer_id } = productRows[0];
    const [currentCart] = await pool.execute('CALL getNearbyCartItemsByUserId(?)', [userId]);

    if (currentCart.length > 0 && currentCart[0].dealer_id !== dealer_id) {
      return res.status(409).json({
        error: "Cart contains items from a different dealer.",
        actionRequired: "replace"  // Indicate that replacement is needed
      });
    }

    await pool.execute(
      "CALL addCartItemToNearbyCart(?, ?, ?, ?, ?, ?, ?)",
      [userId, productId, name, discount_price, image_url, quantity, dealer_id]
    );

    res.json({ message: "Product added to nearby cart successfully" });
  } catch (error) {
    console.error("Error adding product to nearby cart:", error);
    res.status(500).json({ error: "Failed to add product to nearby cart", detail: error.message });
  }
});

// Replace nearby cart with a new product
app.post('/api/nearby/cart/replace', async (req, res) => {
  const { productId, quantity, dealerId } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    // Delete the existing items
    await pool.execute("CALL clearNearbyCart(?)", [userId]);

    // Insert the new item
    const [productRows] = await pool.execute('CALL getProductById(?)', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const { name, discount_price, image_url } = productRows[0];

    await pool.execute(
      "CALL addCartItemToNearbyCart(?, ?, ?, ?, ?, ?, ?)",
      [userId, productId, name, discount_price, image_url, quantity, dealerId]
    );

    res.json({ message: "Cart replaced and new product added successfully" });
  } catch (error) {
    console.error("Error replacing cart:", error);
    res.status(500).json({ error: "Failed to replace cart", detail: error.message });
  }
});
// Endpoint to fetch nearby cart items
app.get('/api/nearby/cart', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    const [rows] = await pool.execute('CALL getNearbyCartItemsByUserId(?)', [userId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching nearby cart items:", error);
    res.status(500).json({ error: "Failed to fetch nearby cart items" });
  }
});

// Endpoint to update the quantity of a cart item
app.patch('/api/nearby/cart/items/:id', async (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.id;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity not provided" });
  }

  try {
    const [result] = await pool.execute('CALL updateNearbyCartItemQuantityById(?, ?)', [cartItemId, quantity]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Failed to update cart item quantity" });
  }
});

// Endpoint to delete a cart item
app.delete('/api/nearby/cart/:id', async (req, res) => {
  const cartItemId = req.params.id;

  try {
    const [result] = await pool.execute('CALL deleteNearbyCartItemById(?)', [cartItemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found or already deleted" });
    }

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch user's longitude
app.get('/api/user/longitude', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const [user] = await pool.execute('CALL getUserLongitude(?)', [userId]);
    if (user.length > 0) {
      res.json({ longitude: user[0].longitude });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user longitude:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to add a nearby address
app.post('/api/nearby/address', async (req, res) => {
  const { name, door_no, address_lane, landmark, pincode, city, state, phonenumber } = req.body;
  const userId = req.session.userId; // Assuming you have user authentication and session management

  if (!userId) {
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    // Save the address details to the database
    await pool.execute(
      "CALL addNearbyAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber, new Date()]
    );

    res.json({ message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ error: "Failed to add address" });
  }
});

// Endpoint to fetch user's nearby addresses
app.get('/api/users/nearby-addresses', async (req, res) => {
  const userId = req.session.userId;
  const { pincode } = req.query; // Get the pincode from query parameters
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    let query = 'CALL getUserNearbyAddresses(?)';
    const queryParams = [userId];

    // If pincode is provided, add it to the query
    if (pincode) {
      query += ' AND pincode = ?';
      queryParams.push(pincode);
    }

    const [addresses] = await pool.execute(query, queryParams);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching nearby addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to place a nearby order
app.post('/api/nearby/orders', async (req, res) => {
  const { addressId, items, totalPrice } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not signed in." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the last formatted order ID and calculate the new one
    const [lastOrder] = await connection.execute('CALL getNextFormattedOrderId()');
    let nextOrderIdNumber = 1;
    if (lastOrder.length > 0) {
      nextOrderIdNumber = parseInt(lastOrder[0].formatted_order_id) + 1;
    }
    const formattedOrderId = nextOrderIdNumber.toString().padStart(6, '0');

    // Determine the estimated delivery date based on order time
    const orderTime = new Date();
    const deliveryDate = new Date();
    if (orderTime.getHours() < 9 || orderTime.getHours() >= 21) {
      deliveryDate.setDate(deliveryDate.getDate() + 1); // Set to the next day if before 9 AM or after 9 PM
    }

    // Insert the order into the nearby_orders table with the new formatted order ID
    const [orderResult] = await connection.execute(
      'CALL createNearbyOrder(?, ?, ?, ?, ?)',
      [userId, addressId, totalPrice, formattedOrderId, deliveryDate]
    );
    const orderId = orderResult.insertId;

    // Process each item in the order
    for (const item of items) {
      // Fetch product details including the dealer ID
      const [productRows] = await connection.execute(
        'CALL getProductById(?)',
        [item.productId]
      );
      if (productRows.length === 0) {
        throw new Error("Product not found");
      }

      const product = productRows[0];
      if (product.instockqty < item.quantity) {
        throw new Error("Insufficient stock for product ID " + item.productId);
      }

      // Update the stock quantity
      const newStock = product.instockqty - item.quantity;
      await connection.execute(
        'CALL updateProductStock(?, ?)',
        [item.productId, newStock]
      );

      // Insert the order item
      await connection.execute(
        'CALL addNearbyOrderItem(?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, product.discount_price]
      );

      // Get dealer info and send email
      const [dealerRows] = await connection.execute(
        'CALL getDealerById(?)',
        [product.dealer_id]
      );
      if (dealerRows.length > 0) {
        const dealerEmail = dealerRows[0].email;
        sendEmailToDealer(dealerEmail, product.name, item.quantity);
      }
    }

    // Delete cart items after order is placed successfully
    await connection.execute(
      'CALL clearNearbyCart(?)',
      [userId]
    );

    // Commit transaction
    await connection.commit();
    res.status(201).json({ message: "Order placed successfully", orderId: formattedOrderId, estimatedDelivery: deliveryDate.toISOString().split('T')[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Order placement failed:', error);
    res.status(500).json({ error: "Order placement failed", details: error.message });
  } finally {
    connection.release();
  }
});

async function sendEmailToDealer(email, productName, quantity) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Order Received',
    text: `You have received a new order for ${quantity} unit(s) of ${productName}. Please check your dashboard for details.`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
// Endpoint to fetch nearby orders for dealer
app.get('/dealer/nearbyOrders', async (req, res) => {
  if (!req.session.dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const dealerId = req.session.dealerId;

  try {
    // This query assumes you have some logic to determine "nearby". Adjust accordingly.
    const [orders] = await pool.execute('CALL getNearbyOrdersByDealerId(?)', [dealerId]);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching nearby orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

let liveLocationTracking = false;

// Endpoint to toggle live location tracking
app.post('/delivery-agent/live-location-tracking', (req, res) => {
  const { tracking } = req.body;
  liveLocationTracking = tracking;
  // You can add logic to store tracking status in the database if needed
  res.json({ message: `Live location tracking is now ${tracking ? 'on' : 'off'}` });
});

// Endpoint to receive live location updates
app.post('/delivery-agent/live-location', (req, res) => {
  if (liveLocationTracking) {
    const { latitude, longitude } = req.body;
    // Store the live location data in the database or perform any required actions
    console.log(`Live location update received: Latitude - ${latitude}, Longitude - ${longitude}`);
  }
  res.sendStatus(200);
});

// Endpoint to fetch order history for user
app.get('/api/orders/history', async (req, res) => {
  const userId = req.session.userId; // Assuming you store user ID in session

  try {
    const connection = await pool.getConnection();

    // Fetch orders for the user
    const [orders] = await connection.execute('CALL getUserOrdersHistory(?)', [userId]);

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await connection.execute('CALL getOrderItemsByOrderId(?)', [order.id]);
      return { ...order, items };
    }));

    connection.release();

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch product suggestions for user
app.get('/api/user/suggestions', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    // Fetch the categories of products the user previously ordered
    const [orderCategories] = await pool.execute('CALL getUserOrderCategories(?)', [userId]);

    if (orderCategories.length === 0) {
      return res.json([]);
    }

    const categories = orderCategories.map(row => row.category);

    // Fetch suggestions based on those categories (excluding already ordered products)
    const [suggestions] = await pool.execute('CALL getUserProductSuggestions(?, ?)', [categories, userId]);

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.listen(3001, () => {
  console.log('Server running on port 3001');
});