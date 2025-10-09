const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  // 行为ID（用于唯一标识）
  behaviorId: {
    type: String,
    required: true,
    index: true,
  },

  // 行为类型
  type: {
    type: String,
    required: true,
    enum: [
      'click', // 点击事件
      'scroll', // 滚动事件
      'input', // 输入事件
      'focus', // 焦点事件
      'blur', // 失焦事件
      'resize', // 窗口大小调整
      'navigation', // 导航事件
      'page_view', // 页面浏览
      'session_start', // 会话开始
      'session_end', // 会话结束
      'custom', // 自定义事件
    ],
    index: true,
  },

  // 行为动作（更具体的描述）
  action: {
    type: String,
    required: true,
  },

  // 用户ID
  userId: {
    type: String,
    default: '',
    index: true,
  },

  // 会话ID
  sessionId: {
    type: String,
    required: true,
    index: true,
  },

  // 页面URL
  url: {
    type: String,
    required: true,
    index: true,
  },

  // 用户代理
  userAgent: {
    type: String,
    required: true,
  },

  // 时间戳
  timestamp: {
    type: Number,
    required: true,
    index: true,
  },

  // 页面加载时间（毫秒）
  pageLoadTime: {
    type: Number,
    default: 0,
  },

  // 重要程度级别
  level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },

  // 自定义数据
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // 数据库字段
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    default: 0,
  },
});

// 添加复合索引
userBehaviorSchema.index({ type: 1, timestamp: -1 });
userBehaviorSchema.index({ sessionId: 1, timestamp: 1 });
userBehaviorSchema.index({ userId: 1, timestamp: -1 });
userBehaviorSchema.index({ url: 1, type: 1 });
userBehaviorSchema.index({ created_at: -1 });

// 更新时间中间件
userBehaviorSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model(
  'UserBehavior',
  userBehaviorSchema,
  'user_behaviors'
);
