
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3001;

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const dbOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'happy'
};

const db = mysql.createPool(dbOptions);

// Create session table if not exists
db.execute(`
  CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    data TEXT,
    PRIMARY KEY (session_id)
  );
`).catch(err => {
  console.error('Error creating session table:', err);
});

const sessionStore = new MySQLStore({}, db);

app.use(session({
  secret: 'your secret key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if served over HTTPS
    sameSite: 'lax'
  }  
}));

app.set('trust proxy', 1);




app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT id, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    if (await bcrypt.compare(password, user.password)) {
      // Ensure correct setting of the cookie
      res.cookie('userId', user.id.toString(), { 
        httpOnly: true, 
        sameSite: 'strict',
        path: '/', // Ensure the cookie is set for the entire domain
        secure: false, // Set to true if using HTTPS
        maxAge: 86400 * 1000 // Optional: Set cookie expiration
      });
      res.json({ message: 'Sign-in successful' });
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/dealer/register', async (req, res) => {
  const { name, phone, email, password, age, address, locationLink, shopName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO dealers (name, phone, email, age, address, password, location_link, shop_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, email, age, address, hashedPassword, locationLink, shopName]
    );
    res.status(201).json({ message: 'Dealer registered successfully' });
  } catch (error) {
    console.error('Error registering dealer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/dealer/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT id, password FROM dealers WHERE email = ?', [email]);
    console.log('Rows:', rows); // Log the retrieved rows
    if (rows.length === 0) {
      console.log('Dealer not found');
      return res.status(400).json({ message: 'Dealer not found' });
    }
    const dealer = rows[0];
    if (await bcrypt.compare(password, dealer.password)) {
      console.log('Dealer ID:', dealer.id); // Log the dealer ID
      req.session.dealerId = dealer.id; 
      console.log('Dealer ID set in session:', req.session.dealerId); //// Store dealer ID in the session
      res.cookie('dealerId', dealer.id.toString(), { 
        httpOnly: true,
        sameSite: 'strict',
        path: '/dealer',
        secure: false,
        maxAge: 86400 * 1000
      });
      res.json({ message: 'Dealer sign-in successful' });
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error signing in dealer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('dealerId');
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.send({ message: 'Logout successful' });
  });
});

app.post('/dealer/addProduct', upload.single('image'), async (req, res) => {
  const { name, price, description } = req.body;
  const image = req.file.path;
  // Assuming you're managing authentication and have dealerId available in some way
  const dealerId = req.session.dealerId; // Or retrieve dealer ID through another method if session is not used

  if (!dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    await db.execute(
      'INSERT INTO products (name, price, description, image, dealer_id) VALUES (?, ?, ?, ?, ?)',
      [name, price, description, image, dealerId]
    );
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Add this route to retrieve the dealer ID
app.get('/dealer/id', (req, res) => {
  console.log('Received request to /dealer/id');
  
  // Check if req.session exists and has the dealerId property
  if (req.session && req.session.dealerId) {
    const dealerId = req.session.dealerId;
    console.log('Dealer ID set in session:', req.session.dealerId); // Log the dealerId retrieved from session
    res.json({ dealerId }); // Send the dealerId directly from req.session
  } else {
    console.log('Dealer ID not found in session'); // Log if dealerId is not found in session
    res.status(404).json({ error: 'Dealer ID not found in session' });
  }
});




app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Route to fetch cart items
app.get('/api/cart', async (req, res) => {
  const userId = req.cookies.userId; // Assuming you're using cookie-parser middleware

  // Check if userId cookie exists
  if (!userId) {
    // If user is not signed in, return an error response
    return res.status(401).json({ error: "User is not signed in" });
  }

  try {
    // Retrieve cart items for the logged-in user from the database
    const [rows] = await db.query(
      "SELECT * FROM cart_items WHERE user_id = ?",
      [userId]
    );

    // Send the retrieved cart items as a JSON response
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});
// Route to delete a cart item by ID
// Route to delete a cart item by ID
app.delete("/api/cart/:product_id", async (req, res) => {
  const productId = req.params.product_id;

  try {
    // Perform a database query to delete the cart item by ID
    await db.execute("DELETE FROM cart_items WHERE product_id = ?", [productId]);
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update the quantity of a cart item by its ID
app.patch("/api/cart/items/:product_id", async (req, res) => {
  const productId = req.params.product_id;
  const { change } = req.body;

  try {
    // Perform a database query to update the quantity of the cart item by ID
    await db.execute("UPDATE cart_items SET quantity = ? WHERE product_id = ?", [change, productId]);
    res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Failed to update cart item quantity", detail: error.message });
  }
});



// Route to fetch all items from the database
app.get('/api/items', async (req, res) => {
  try {
    // Query the database to retrieve all items
    const [rows] = await db.query('SELECT * FROM items');
    res.json(rows); // Send the retrieved items as a JSON response
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});