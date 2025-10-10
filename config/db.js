const mongoose = require('mongoose');

// 自动判断环境并切换数据库连接
// NODE_ENV: development(开发环境) | production(生产环境) | test(测试环境)

// 获取当前环境，默认为 development
const env = process.env.NODE_ENV || 'development';

// 根据环境选择数据库连接字符串
let dbUrl;

if (process.env.DB_URL) {
  // 优先使用环境变量中的 DB_URL（最高优先级）
  dbUrl = process.env.DB_URL;
} else if (env === 'production') {
  // 生产环境：使用带认证的远程数据库
  dbUrl =
    'mongodb://gukai:Gk324376@172.17.0.1:27017/product_info?authSource=admin';
} else {
  // 开发环境：使用本地数据库
  dbUrl = 'mongodb://localhost:27017/product_info';
}

console.log(`当前环境: ${env}`);
console.log(`数据库连接: ${dbUrl.replace(/\/\/.*:.*@/, '//***:***@')}`); // 隐藏密码输出

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => console.log('成功连接到 MongoDB 数据库'));

module.exports = mongoose;
