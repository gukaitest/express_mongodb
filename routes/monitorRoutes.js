const express = require('express');
const router = express.Router();
const {
  reportWebVitals,
  getWebVitalsStats,
  getMemoryLeakStats,
  getMemoryLeakSummaryStats,
  // 错误监控相关方法
  createError,
  createBatchErrors,
  getErrors,
  getErrorById,
  updateErrorStatus,
  deleteError,
  getErrorStats,
  getTopErrors,
} = require('../controllers/monitorController');

// 上报WebVitals数据
router.post('/webvitals', reportWebVitals);

// 获取WebVitals统计数据
router.get('/webvitals/stats', getWebVitalsStats);

// 获取MemoryLeak统计数据
router.get('/memory-leak/stats', getMemoryLeakStats);

// 获取MemoryLeakSummary统计数据
router.get('/memory-leak-summary/stats', getMemoryLeakSummaryStats);

// ============== 错误监控路由 ==============
// 错误记录路由
router.post('/errors', createError); // 创建单个错误记录
router.post('/errors/batch', createBatchErrors); // 批量创建错误记录
router.get('/errors', getErrors); // 获取错误列表
router.get('/errors/stats', getErrorStats); // 获取错误统计信息
router.get('/errors/top', getTopErrors); // 获取热门错误
router.get('/errors/:id', getErrorById); // 根据ID获取错误详情
router.put('/errors/:id/status', updateErrorStatus); // 更新错误状态
router.delete('/errors/:id', deleteError); // 删除错误记录

module.exports = router;
