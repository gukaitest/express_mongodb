const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search ? { product_name: { $regex: new RegExp(search, 'i') } } : {};
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({ code: "0000", msg: "请求成功", data: { products, total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 其他方法：getProductById, updateProduct, deleteProduct...