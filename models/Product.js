const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: { type: Number, unique: true },
  product_name: { type: String, unique: true },
  price: Number,
  category: String,
  stock: Number,
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema, 'products');
    