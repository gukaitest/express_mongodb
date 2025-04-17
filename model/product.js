const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/your_database_name', {
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
    