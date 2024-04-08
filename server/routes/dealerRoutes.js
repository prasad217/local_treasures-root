const bcrypt = require('bcrypt');
const pool = require('../utils/dbUtils');

async function register(req, res) {
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
}

async function signin(req, res) {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT id, password FROM dealers WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const dealer = rows[0];
        if (await bcrypt.compare(password, dealer.password)) {
            req.session.dealerId = dealer.id; // Securely set dealerId in the session
            res.json({ message: 'Sign-in successful' });
        } else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Add more functions as needed (e.g., addProduct, deleteProduct)

module.exports = { register, signin };
