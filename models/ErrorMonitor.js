const mongoose = require('mongoose');

const errorMonitorSchema = new mongoose.Schema({
  // 基础信息
  type: {
    type: String,
    required: true,
    enum: [
      'javascript',
      'network',
      'resource',
      'promise',
      'unhandledrejection',
      'custom',
      'performance',
      'memory',
      'vue',
    ],
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: false,
  },
  filename: {
    type: String,
    required: false,
  },
  lineno: {
    type: Number,
    required: false,
  },
  colno: {
    type: Number,
    required: false,
  },

  // 上下文信息
  url: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  sessionId: {
    type: String,
    required: false,
  },

  // Vue组件相关
  componentName: {
    type: String,
    required: false,
  },
  componentStack: {
    type: String,
    required: false,
  },
  propsData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  route: {
    type: String,
    required: false,
  },
  routeParams: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  routeQuery: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },

  // 资源错误信息
  resourceType: {
    type: String,
    required: false,
  },
  resourceUrl: {
    type: String,
    required: false,
  },

  // 请求错误信息
  requestUrl: {
    type: String,
    required: false,
  },
  requestMethod: {
    type: String,
    required: false,
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  responseStatus: {
    type: Number,
    required: false,
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },

  // 自定义信息
  customData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },

  // 错误ID（用于去重）
  errorId: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // 允许空值，但如果有值则必须唯一
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

// 添加索引
errorMonitorSchema.index({ type: 1, timestamp: -1 });
errorMonitorSchema.index({ url: 1, timestamp: -1 });
errorMonitorSchema.index({ level: 1 });
errorMonitorSchema.index({ userId: 1 });
errorMonitorSchema.index({ sessionId: 1 });
// 避免重复报错,
// errorMonitorSchema.index({ errorId: 1 });
errorMonitorSchema.index({ created_at: -1 });
errorMonitorSchema.index({ componentName: 1 });
errorMonitorSchema.index({ route: 1 });

// 更新时间中间件
errorMonitorSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// 生成错误ID的中间件（如果未提供）
errorMonitorSchema.pre('save', function (next) {
  if (!this.errorId && this.message && this.filename && this.lineno) {
    // 基于错误信息生成唯一ID用于去重
    const crypto = require('crypto');
    const errorString = `${this.type}-${this.message}-${this.filename}-${this.lineno}-${this.colno}`;
    this.errorId = crypto.createHash('md5').update(errorString).digest('hex');
  }
  next();
});

module.exports = mongoose.model(
  'ErrorMonitor',
  errorMonitorSchema,
  'error_monitors'
);
