const bcrypt = require('bcrypt');
const pool = require('../utils/dbUtils');

async function register(req, res) {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}

async function signin(req, res) {
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
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}

module.exports = { register, signin };
