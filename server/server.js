require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');


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
    cb(null, '/Users/prasad/Desktop/react-version1 copy/server/uploads/');
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

const pool = mysql.createPool(dbOptions);

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
    const [rows] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
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
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);

    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, discount_price, image_url } = productRows[0];

    // Add the product to the cart in the database
    await pool.execute(
      "INSERT INTO cart_items (user_id, product_id, name, price, image_url) VALUES (?, ?, ?, ?, ?)",
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
   const [rows] = await pool.query(
     "SELECT * FROM cart_items WHERE user_id = ?",
     [userId]
   );

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
    const [result] = await pool.execute(
      "DELETE FROM cart_items WHERE id = ?",
      [productId]
    );
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
  const { quantity } = req.body; // Make sure you're expecting the right property

  if (!quantity) {
    return res.status(400).json({ error: "Quantity not provided" });
  }

  console.log(`Updating quantity for product ID ${productId} to ${quantity}`);

  try {
    const [result] = await pool.execute(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, productId]
    );

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
  const userId = req.session.userId; // Retrieve userId from session

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    // Example of fetching user details from the database
    const [rows] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [userId]);
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

app.post('/api/address', async (req, res) => {
  const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

  // Check if the user is logged in
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  // Extract address data from request body
  const { name, door_no, address_lane, landmark, pincode, city, state, phonenumber } = req.body;

  try {
    // Insert or update the address in the user_addresses table
    // Assuming there can be only one address per user, update if exists else insert
    const query = `
      INSERT INTO user_addresses (user_id, name, door_no, address_lane, landmark, pincode, city, state, phonenumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), door_no=VALUES(door_no), address_lane=VALUES(address_lane), 
                              landmark=VALUES(landmark), pincode=VALUES(pincode), city=VALUES(city), 
                              state=VALUES(state), phonenumber=VALUES(phonenumber)`;

    await pool.execute(query, [userId, name, door_no, address_lane, landmark, pincode, city, state, phonenumber]);

    // After saving, retrieve and return the latest address of the user
    const [rows] = await pool.query('SELECT * FROM user_addresses WHERE user_id = ?', [userId]);
    
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

// Assuming this is a part of your Express app setup

app.get('/api/users/addresses', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
      const [addresses] = await pool.query('SELECT * FROM user_addresses WHERE user_id = ?', [userId]);
      res.json(addresses);
  } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ error: 'Server error' });
  }
});



//dealer backend

app.post('/dealer/register', async (req, res) => {
  const { name, phone, email, password, age, address, locationLink, shopName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
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
    const [rows] = await pool.query('SELECT id, password FROM dealers WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const dealer = rows[0];
    if (await bcrypt.compare(password, dealer.password)) {
      // Authenticate and set dealerId in session rather than a cookie
      req.session.dealerId = dealer.id; // Securely set dealerId in the session

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

app.get('/dealer/info', async (req, res) => {
  if (!req.session.dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    // Example of fetching dealer details from the database
    const [rows] = await pool.query('SELECT id, name, email FROM dealers WHERE id = ?', [req.session.dealerId]);
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
  const dealerId = req.session.dealerId; // Assume this is where you store logged in dealer's ID

  // Decide on image_url based on whether an image was uploaded or a URL was provided
  let imageUrl = '';
  if (imageType === 'upload' && req.file) {
    imageUrl = req.file.path; // Path where the uploaded image is saved
  } else if (imageType === 'url') {
    imageUrl = imageUrlInput; // Directly use the URL provided by the user
  }

  // Validate required fields
  if (!dealerId || !name || isNaN(actualCost) || isNaN(discountPrice) || isNaN(instockqty) || !category) {
    console.error('Missing or invalid fields', {
      dealerId, name, actualCost, discountPrice, instockqty, category
    });
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const query = `
      INSERT INTO products (dealer_id, name, image_url, description, actual_cost, discount_price, instockqty, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category];
    await pool.execute(query, params);

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add this route to fetch products by dealer ID
app.get('/dealer/products/:dealerId', async (req, res) => {
    const dealerId = req.session.dealerId; // Retrieve userId from session
  
    console.log("Session Info:", req.session); // Debugging: Log session info
  
   // Check if userId exists in the session
   if (!dealerId) {
     console.error("dealer ID not found in session"); // Log for debugging
     return res.status(401).json({ error: "dealer is not signed in" });
   }
  
   try {
     // Retrieve cart items for the logged-in user from the database
     const [rows] = await pool.query(
       "SELECT * FROM products WHERE dealer_id = ?",
       [dealerId]
     );
  
     console.log("Cart Items Fetched:", rows); // Debugging: Log fetched cart items
  
     // Send the retrieved cart items as a JSON response
     res.json(rows);
   } catch (error) {
     console.error("Error fetching cart items:", error);
     res.status(500).json({ error: "Failed to fetch cart items" });
   }
  });


app.delete("/api/dealer/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  console.log(`Attempting to delete product with ID: ${productId}`); // Debugging log

  try {
    const [result] = await pool.execute(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );
    console.log("Deletion result:", result); // Log result to debug

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "product not found or already deleted" });
    }

    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/orders', async (req, res) => {
  const { addressId, items, totalPrice } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not signed in." });
  }

  // Example: Save the order in the database
  // This is simplified and might involve multiple queries depending on your schema
  const [orderResult] = await pool.query('INSERT INTO orders (user_id, address_id, total_price) VALUES (?, ?, ?)', [userId, addressId, totalPrice]);
  const orderId = orderResult.insertId;

  for (const item of items) {
    // Check if the product exists in the database
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [item.productId]);
  
    if (productRows.length > 0) {
      const product = productRows[0];
      const dealerId = product.dealer_id;
  
      // Check if the dealer ID is defined
      if (dealerId) {
        const [dealerRows] = await pool.query('SELECT email FROM dealers WHERE id = ?', [dealerId]);
  
        if (dealerRows.length > 0) {
          const dealerEmail = dealerRows[0].email;
          // Send email to the dealer if email is present
          await sendEmailToDealer(dealerEmail, item);
        } else {
          console.error(`Dealer with ID ${dealerId} not found.`);
        }
  
        // Save order details with the correct product_id
        await pool.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)', [orderId, item.productId, item.quantity]);
      } else {
        console.error(`Dealer ID not found for product with ID ${item.productId}.`);
      }
    } else {
      console.error(`Product with ID ${item.productId} not found.`);
    }
  }
  
  
  res.json({ message: "Order placed successfully", orderId: orderId });
});
async function sendEmailToDealer(email, item) {
  if (!email) {
    console.error('No email recipient specified');
    return; // Exit function if no email recipient is provided
  }

  try {
    // Fetch product details based on product ID
    const [productRows] = await pool.query('SELECT name, image_url FROM products WHERE id = ?', [item.productId]);

    if (productRows.length > 0) {
      const { name, image_url } = productRows[0];

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'New Order Notification',
        text: `You have a new order for the following item: ${name} (Quantity: ${item.quantity}). Please prepare it for shipment.`,
        // Consider using HTML email for better formatting
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } else {
      console.error(`Product with ID ${item.productId} not found.`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}


app.get('/dealer/orders', async (req, res) => {
  const dealerId = req.session.dealerId;
  if (!dealerId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const query = `
      SELECT o.id AS orderId, o.total_price, oi.quantity, p.id AS productId, p.name, p.image_url
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      WHERE p.dealer_id = ?
      ORDER BY o.id DESC
    `;
    const [orders] = await pool.query(query, [dealerId]);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching dealer orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



//products backend

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch all items from the database
app.get('/api/items', async (req, res) => {
  try {
    // Query the database to retrieve all items
    const [rows] = await pool.query('SELECT * FROM items');
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
    const [products] = await pool.query(query, [categoryName]);
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
    const [product] = await pool.query(query, [productId]);
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
