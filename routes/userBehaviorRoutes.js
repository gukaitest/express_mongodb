const express = require('express');
const router = express.Router();
const {
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

// ============== 用户行为监控路由 ==============

// 用户行为记录路由
router.post('/', createUserBehavior); // 创建单个用户行为记录
router.post('/batch', createBatchUserBehaviors); // 批量创建用户行为记录
router.get('/', getUserBehaviors); // 获取用户行为列表
router.get('/stats', getUserBehaviorStats); // 获取用户行为统计信息
router.get('/top', getTopUserBehaviors); // 获取热门用户行为
router.get('/paths', getUserBehaviorPaths); // 获取用户行为路径分析
router.get('/funnel', getFunnelAnalysis); // 获取漏斗分析数据
router.get('/heatmap', getHeatmapData); // 获取热力图数据
router.get('/:id', getUserBehaviorById); // 根据ID获取用户行为详情
router.delete('/:id', deleteUserBehavior); // 删除用户行为记录

module.exports = router;
