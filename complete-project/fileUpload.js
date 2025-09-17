const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// MongoDB 连接
mongoose.connect('mongodb://localhost:27017/file_upload', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});

// 文件分片模型
const ChunkSchema = new mongoose.Schema({
    filename: String,
    hash: { type: String, unique: true },
    index: Number
});

const Chunk = mongoose.model('Chunk', ChunkSchema);

// 文件模型
const FileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    hash: { type: String, unique: true },
    status: { type: String, enum: ['uploading', 'completed'], default: 'uploading' }
});

const File = mongoose.model('File', FileSchema);

const app = express();
app.use(cors());
app.use(express.json());
const UPLOAD_DIR = path.resolve(__dirname, 'uploads');

// 验证接口
app.post('/api/verify', async (req, res) => {
    const { filename, hash } = req.body;

    try {
        // 检查是否已存在完整文件
        const exists = await File.findOne({ hash, status: 'completed' });
        if (exists) return res.json({ exists: true });

        // 获取已上传分片
        const chunks = await Chunk.find({ filename: hash });
        return res.json({
            exists: false,
            uploadedChunks: chunks.map(c => c.hash)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 分片上传
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { filename } = req.body;
        const chunkDir = path.join(UPLOAD_DIR, filename);
        await fs.mkdir(chunkDir, { recursive: true });
        cb(null, chunkDir);
    },
    filename: (req, file, cb) => {
        const { hash } = req.body;
        cb(null, hash);
    }
});

const upload = multer({ storage });
app.post('/api/upload', upload.single('chunk'), async (req, res) => {
    try {
        const { filename, hash, index } = req.body;

        // 记录分片信息
        await Chunk.create({
            filename,
            hash,
            index: parseInt(index)
        });

        // 更新文件状态
        await File.findOneAndUpdate(
            { hash: filename },
            { $setOnInsert: { filename, hash: filename, status: 'uploading' } },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 合并文件
app.post('/api/merge', async (req, res) => {
    const { filename, hash, size } = req.body;
    const chunkDir = path.join(UPLOAD_DIR, hash);

    try {
        // 获取所有分片并排序
        const chunks = await Chunk.find({ filename: hash }).sort({ index: 1 });

        // 合并文件
        const filePath = path.join(UPLOAD_DIR, filename);
        await Promise.all(
            chunks.map((chunk, index) => {
                return new Promise((resolve) => {
                    const readStream = fs.createReadStream(path.join(chunkDir, chunk.hash));
                    const writeStream = fs.createWriteStream(filePath, {
                        start: index * size
                    });
                    readStream.pipe(writeStream).on('finish', resolve);
                });
            })
        );

        // 更新文件状态
        await File.findOneAndUpdate(
            { hash },
            { status: 'completed' }
        );

        // 清理分片
        await fs.rm(chunkDir, { recursive: true });
        await Chunk.deleteMany({ filename: hash });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3003, () => {
    console.log('Server running on port 3003');
});
    


   // "start": "nodemon index.js",