const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/product_info', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => {
    console.log('成功连接到 MongoDB 数据库');
});

// 定义数据模型
const productSchema = new mongoose.Schema({
    product_id: Number,
    product_name: String,
    price: String,
    description: String,
    stock: Number
});

const Product = mongoose.model('Product', productSchema);

// 解析 JSON 请求体
app.use(express.json());

// 创建新商品
app.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 获取所有商品
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据 ID 获取单个商品
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ product_id: req.params.id });
        if (!product) {
            return res.status(404).json({ error: '商品未找到' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新商品信息
app.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { product_id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ error: '商品未找到' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除商品
app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ product_id: req.params.id });
        if (!deletedProduct) {
            return res.status(404).json({ error: '商品未找到' });
        }
        res.json(deletedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
});
    