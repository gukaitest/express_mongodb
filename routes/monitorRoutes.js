const express = require('express');
const router = express.Router();
const { reportWebVitals, getWebVitalsStats } = require('../controllers/monitorController');

// 上报WebVitals数据
router.post('/webvitals', reportWebVitals);

// 获取WebVitals统计数据
router.get('/webvitals/stats', getWebVitalsStats);

module.exports = router;
