const mongoose = require('mongoose');

const webVitalsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP', 'FPS', 'LongTask'], // 添加 LongTask
  },
  value: { type: Number, required: true },
  rating: {
    type: String,
    required: true,
    enum: ['good', 'needs-improvement', 'poor'],
  },
  delta: { type: Number, required: true },
  id: { type: String, required: true },
  navigationType: { type: String, required: true },
  timestamp: { type: Number, required: true },
  url: { type: String, required: true },
  userAgent: { type: String, required: true },

  // LongTask 特定字段（可选）
  startTime: { type: Number }, // LongTask 开始时间
  endTime: { type: Number }, // LongTask 结束时间
  taskType: {
    type: String,
    enum: ['script', 'layout', 'paint', 'composite', 'other'],
    default: 'other',
  },
  attribution: {
    name: { type: String },
    entryType: { type: String },
    containerType: { type: String },
    containerSrc: { type: String },
    containerId: { type: String },
    containerName: { type: String },
  },

  created_at: { type: Date, default: Date.now },
});

// 添加索引
webVitalsSchema.index({ name: 1, timestamp: -1 });
webVitalsSchema.index({ url: 1, timestamp: -1 });
webVitalsSchema.index({ rating: 1 });

module.exports = mongoose.model('WebVitals', webVitalsSchema, 'web_vitals');
