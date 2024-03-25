require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
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

// Create session middleware with default session store
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Consider environment to set appropriately
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
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const dealer = rows[0];
    if (await bcrypt.compare(password, dealer.password)) {
      // Ensure correct setting of the cookie
      res.cookie('dealerId', dealer.id.toString(), { 
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
  
  // Check if req.file exists and contains the file
  const image = req.file ? req.file.path : null;

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

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/cart', async (req, res) => {
  const { productId } = req.body;
  const userId = req.cookies.userId; // Assuming you're using cookie-parser middleware

  // Check if userId cookie exists
  if (!userId) {
    // Redirect to sign-in page if user is not signed in
    return res
      .status(401)
      .json({
        error:
          "User is not signed in. Please sign in to add products to the cart.",
      });
  }

  try {
    // Retrieve product details from the products table
    const [rows] = await db.query(
      "SELECT name, discount_price, image_url FROM products WHERE id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url } = rows[0];

    // Perform database insert to add the product to the cart with user ID
    await db.execute(
      "INSERT INTO cart_items (user_id, product_id, name, price, image_url) VALUES (?, ?, ?, ?, ?)",
      [userId, productId, name, discount_price, image_url]
    );

    console.log("Product added to cart successfully");
    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Failed to add product to cart" });
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

app.delete("/api/cart/:product_id", (req, res) => {
  const productId = req.params.product_id;

  // Perform a database query to delete the cart item by ID
  pool.query(
    "DELETE FROM cart_items WHERE product_id = ?",
    [productId],
    (error, results) => {
      if (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json({ message: "Cart item deleted successfully" });
      }
    }
  );
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

// Route to fetch products by category
app.get('/api/products/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  try {
    const query = 'SELECT * FROM products WHERE category = ?';
    const [products] = await db.query(query, [categoryName]);
    if (products.length) {
      res.json(products);
    } else {
      res.status(404).send('No products found for this category');
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const query = 'SELECT * FROM products WHERE id = ?';
    const [product] = await db.query(query, [productId]);
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


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
