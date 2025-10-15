const express = require('express');
const router = express.Router();
const {
  reportWebVitals,
  reportBatchWebVitals,
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
  // 用户行为监控相关方法
  createUserBehavior,
  createBatchUserBehaviors,
  getUserBehaviors,
  getUserBehaviorById,
  getUserBehaviorStats,
  getTopUserBehaviors,
  getUserBehaviorPaths,
  getFunnelAnalysis,
  getHeatmapData,
  deleteUserBehavior,
} = require('../controllers/monitorController');

// ============== WebVitals前端性能监控路由 ==============
// 上报WebVitals数据
router.post('/webvitals', reportWebVitals); // 单个数据上报
router.post('/webvitals-batch', reportBatchWebVitals); // 批量数据上报

// 获取WebVitals统计数据
router.get('/webvitals/stats', getWebVitalsStats);

// 获取MemoryLeak统计数据
router.get('/memory-leak/stats', getMemoryLeakStats);

// 获取MemoryLeakSummary统计数据
router.get('/memory-leak-summary/stats', getMemoryLeakSummaryStats);

// ============== 错误监控路由 ==============
// 错误记录路由
router.post('/errors', createError); // 创建单个错误记录
router.post('/errors-batch', createBatchErrors); // 批量创建错误记录
router.get('/errors', getErrors); // 获取错误列表
router.get('/errors/stats', getErrorStats); // 获取错误统计信息
router.get('/errors/top', getTopErrors); // 获取热门错误
router.get('/errors/:id', getErrorById); // 根据ID获取错误详情
router.put('/errors/:id/status', updateErrorStatus); // 更新错误状态
router.delete('/errors/:id', deleteError); // 删除错误记录

// ============== 用户行为监控路由 ==============
// 用户行为记录路由
router.post('/behaviors', createUserBehavior); // 创建单个用户行为记录
router.post('/behaviors-batch', createBatchUserBehaviors); // 批量创建用户行为记录
router.get('/behaviors', getUserBehaviors); // 获取用户行为列表
router.get('/behaviors/stats', getUserBehaviorStats); // 获取用户行为统计信息
router.get('/behaviors/top', getTopUserBehaviors); // 获取热门用户行为
router.get('/behaviors/paths', getUserBehaviorPaths); // 获取用户行为路径分析
router.get('/behaviors/funnel', getFunnelAnalysis); // 获取漏斗分析数据
router.get('/behaviors/heatmap', getHeatmapData); // 获取热力图数据
router.get('/behaviors/:id', getUserBehaviorById); // 根据ID获取用户行为详情
router.delete('/behaviors/:id', deleteUserBehavior); // 删除用户行为记录

module.exports = router;
