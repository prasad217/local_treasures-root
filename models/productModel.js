const { pool } = require('../config/dbConfig');

const addProduct = async (product) => {
  const {
    dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category
  } = product;

  await pool.execute(
    'CALL addProduct(?, ?, ?, ?, ?, ?, ?, ?)',
    [dealerId, name, imageUrl, description, actualCost, discountPrice, instockqty, category]
  );
};

const getProductsByDealerId = async (dealerId) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE dealer_id = ?', [dealerId]);
  return rows;
};

const deleteProductById = async (productId) => {
  const [result] = await pool.execute('CALL deleteProductById(?)', [productId]);
  return result.affectedRows;
};

const getAllProducts = async () => {
  const [rows] = await pool.query('CALL getAllProducts()');
  return rows;
};

const getProductById = async (productId) => {
  const [product] = await pool.query('CALL getProductById(?)', [productId]);
  return product[0];
};

const getProductsByCategory = async (categoryName) => {
  const [products] = await pool.query('CALL getProductsByCategory(?)', [categoryName]);
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
