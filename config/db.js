const mongoose = require('mongoose');

// 只连接商品数据库
// 使用环境变量或默认值（开发环境）
const dbUrl = process.env.DB_URL || 'mongodb://gukai:Gk324376@172.17.0.1:27017/product_info';
mongoose.connect(dbUrl);
// mongoose.connect('mongodb://localhost:27017/product_info', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => console.log('成功连接到 MongoDB 数据库'));

module.exports = mongoose;