const express = require('express');
const connectDB = require('./config/db');
const cors = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const fse = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// 初始化配置
// connectDB();
// app.use(express.json());
// app.use(cors);
app.use(cors({
  origin: 'http://47.103.169.121:8083', // 仅限前端域名
  credentials: true
}));

// 初始化上传目录
const UPLOAD_DIR = path.resolve(__dirname, 'uploads');
fse.ensureDirSync(UPLOAD_DIR);

// 路由配置
app.use('/products', productRoutes);
app.use('/upload', uploadRoutes);
app.use('/auth', authRoutes);

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});