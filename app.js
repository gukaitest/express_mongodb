const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3002;

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/product_info', {
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

// 指定集合名为 test
const Product = mongoose.model('Product', productSchema, 'user');

// 解析 JSON 请求体
app.use(express.json());

// 登录
app.post('/auth/login', async (req, res) => {
    try {
        const savedProduct = {
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjpbeyJ1c2VyTmFtZSI6IlNveWJlYW4ifV0sImlhdCI6MTY5ODQ4NDg2MywiZXhwIjoxNzMwMDQ0Nzk5LCJhdWQiOiJzb3liZWFuLWFkbWluIiwiaXNzIjoiU295YmVhbiIsInN1YiI6IlNveWJlYW4ifQ._w5wmPm6HVJc5fzkSrd_j-92d5PBRzWUfnrTF1bAmfk",
                "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjpbeyJ1c2VyTmFtZSI6IlNveWJlYW4ifV0sImlhdCI6MTY5ODQ4NDg4MSwiZXhwIjoxNzYxNTgwNzk5LCJhdWQiOiJzb3liZWFuLWFkbWluIiwiaXNzIjoiU295YmVhbiIsInN1YiI6IlNveWJlYW4ifQ.7dmgo1syEwEV4vaBf9k2oaxU6IZVgD2Ls7JK1p27STE"
            },
            "code": "0000",
            "msg": "请求成功"
        };
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
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
        // 若需要打印日志，单独处理（不要在响应方法中调用）
        console.log('响应数据:', products); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 获取用户信息
app.get('/auth/getUserInfo', async (req, res) => {
    try {
        const getUserInfo = {
            "data": {
                "userId": "0",
                "userName": "Soybean",
                "roles": [
                    "R_SUPER"
                ],
                "buttons": [
                    "B_CODE1",
                    "B_CODE2",
                    "B_CODE3"
                ]
            },
            "code": "0000",
            "msg": "请求成功"
        };
        res.json(getUserInfo);
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
    