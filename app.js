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

// 定义商品 Schema
const productSchema = new mongoose.Schema({
    product_id: { type: Number, unique: true },
    product_name: { type: String, unique: true },
    price: { type: Number },
    category: { type: String },
    stock: { type: Number },
    description: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
// 指定集合名为 test
const Product = mongoose.model('Product', productSchema, 'products');

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

// // 获取所有商品
// app.get('/products', async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.json(products);
//         // 若需要打印日志，单独处理（不要在响应方法中调用）
//         console.log('响应数据:', products); 
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// 分页获取所有商品
app.get('/products', async (req, res) => {
    try {
        // 获取请求中的 pageNo 和 pageSize 参数，若未提供则使用默认值
        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const search = req.query.search || '';

        // 构建查询条件
        const query = {};
        if (search) {
            query.product_name = { $regex: new RegExp(search, 'i') };
        }
        // 计算跳过的文档数量
        const skip = (pageNo - 1) * pageSize;

        // 查询当前页的数据
        const products = await Product.find(query)
           .skip(skip)
           .limit(pageSize);

        // 查询总数据数量
        const total = await Product.countDocuments(query);

        // 返回包含当前页数据和总数据数量的响应
        res.json({
            products,
            total
        });

        // 若需要打印日志，单独处理（不要在响应方法中调用）
        console.log('响应数据:', { products, total });
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
    