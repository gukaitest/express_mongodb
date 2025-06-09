const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,

} = require('../controllers/productController');

router.post('/products', createProduct);
router.get('/products', getProducts);


// const {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct
// } = require('../controllers/productController');

// router.post('/', createProduct);
// router.get('/', getProducts);
// router.get('/:id', getProductById);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);

module.exports = router;