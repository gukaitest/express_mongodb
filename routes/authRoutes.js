const express = require('express');
const router = express.Router();
const { login, getUserInfo } = require('../controllers/authController');

// 用户登录
router.post('/login', login);

// 获取用户信息
router.get('/getUserInfo', getUserInfo);

module.exports = router;