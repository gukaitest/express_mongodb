const express = require('express');
const router = express.Router();
const {
  reportWebVitals,
  getWebVitalsStats,
  getMemoryLeakStats,
  getMemoryLeakSummaryStats,
} = require('../controllers/monitorController');

// 上报WebVitals数据
router.post('/webvitals', reportWebVitals);

// 获取WebVitals统计数据
router.get('/webvitals/stats', getWebVitalsStats);

// 获取MemoryLeak统计数据
router.get('/memory-leak/stats', getMemoryLeakStats);

// 获取MemoryLeakSummary统计数据
router.get('/memory-leak-summary/stats', getMemoryLeakSummaryStats);

module.exports = router;
