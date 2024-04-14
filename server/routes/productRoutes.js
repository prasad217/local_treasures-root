require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');


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
  