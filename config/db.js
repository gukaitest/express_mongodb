const mongoose = require('mongoose');

// 上线需切换，数据库连接，只连接商品数据库

// 1.使用默认值（开发环境）
mongoose.connect('mongodb://localhost:27017/product_info', {
});

// 2.部署上线，使用环境变量或默认值（生产环境）
// const dbUrl = process.env.DB_URL || 'mongodb://gukai:Gk324376@172.17.0.1:27017/product_info?authSource=admin';
// mongoose.connect(dbUrl);



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => console.log('成功连接到 MongoDB 数据库'));

module.exports = mongoose;