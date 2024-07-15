// models/productModel.js

const { pool } = require('../config/dbConfig');

const addProduct = async (product) => {
  const {
    dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category
  } = product;

  await pool.execute(
    'INSERT INTO products (dealer_id, name, image_url, description, actual_cost, discount_price, instockqty, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category]
  );
};

const getProductsByDealerId = async (dealerId) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE dealer_id = ?', [dealerId]);
  return rows;
};

const deleteProductById = async (productId) => {
  const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [productId]);
  return result.affectedRows;
};

const getAllProducts = async () => {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows;
};

const getProductById = async (productId) => {
  const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
  return product[0];
};

const getProductsByCategory = async (categoryName) => {
  const [products] = await pool.query('SELECT * FROM products WHERE category = ?', [categoryName]);
  return products;
};


module.exports = {
  addProduct,
  getProductsByDealerId,
  deleteProductById,
  getAllProducts,
  getProductById,
  getProductsByCategory
};
