const productModel = require('../models/productModel');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust as needed

const addProduct = async (req, res) => {
  const { name, description, actualCost, discountPrice, instockqty, category, imageType, imageUrlInput } = req.body;
  const dealerId = req.session.dealerId;

  if (!dealerId || !name || isNaN(actualCost) || isNaN(discountPrice) || isNaN(instockqty) || !category) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  let imageUrl = '';
  if (imageType === 'upload' && req.file) {
    imageUrl = req.file.path;
  } else if (imageType === 'url') {
    imageUrl = imageUrlInput;
  }

  try {
    await productModel.addProduct({
      dealerId, name, imageUrl, description, actualCost: parseFloat(actualCost),
      discountPrice: parseFloat(discountPrice), instockqty: parseInt(instockqty, 10), category
    });

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getProductsByDealerId = async (req, res) => {
  const dealerId = req.session.dealerId;

  if (!dealerId) {
    return res.status(401).json({ error: 'Dealer is not signed in' });
  }

  try {
    const products = await productModel.getProductsByDealerId(dealerId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const affectedRows = await productModel.deleteProductById(productId);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await productModel.getProductById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const products = await productModel.getProductsByCategory(categoryName);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ message: `No products found for category '${categoryName}'` });
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addProduct,
  getProductsByDealerId,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory
};
