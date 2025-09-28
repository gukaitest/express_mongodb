const mongoose = require('mongoose');

const webVitalsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'CLS',
      'FID',
      'FCP',
      'LCP',
      'TTFB',
      'INP',
      'FPS',
      'LongTask',
      'MemoryLeak',
      'MemoryLeakSummary',
    ], // 添加 LongTask、MemoryLeak 和 MemoryLeakSummary
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

  // MemoryLeak 特定字段（可选）
  memoryUsage: { type: Number }, // 内存使用量（字节）
  memoryLimit: { type: Number }, // 内存限制（字节）
  leakType: {
    type: String,
    enum: [
      'dom',
      'event-listener',
      'timer',
      'closure',
      'global-variable',
      'other',
    ],
    default: 'other',
  },
  leakSize: { type: Number }, // 泄漏大小（字节）
  leakCount: { type: Number }, // 泄漏数量
  heapSnapshot: { type: String }, // 堆快照信息（JSON字符串）
  performanceMemory: {
    usedJSHeapSize: { type: Number }, // 已使用的JS堆大小
    totalJSHeapSize: { type: Number }, // 总JS堆大小
    jsHeapSizeLimit: { type: Number }, // JS堆大小限制
  },

  // MemoryLeakSummary 特定字段（可选）
  summaryData: {
    totalLeaks: { type: Number }, // 总泄漏数量
    totalLeakSize: { type: Number }, // 总泄漏大小（字节）
    leakTypes: [
      {
        type: { type: String }, // 泄漏类型
        count: { type: Number }, // 该类型的泄漏数量
        size: { type: Number }, // 该类型的泄漏大小
      },
    ],
    timeRange: {
      startTime: { type: Number }, // 统计开始时间
      endTime: { type: Number }, // 统计结束时间
    },
    avgMemoryUsage: { type: Number }, // 平均内存使用量
    peakMemoryUsage: { type: Number }, // 峰值内存使用量
    memoryTrend: { type: String }, // 内存趋势：'increasing', 'stable', 'decreasing'
  },

  created_at: { type: Date, default: Date.now },
});

// 添加索引
webVitalsSchema.index({ name: 1, timestamp: -1 });
webVitalsSchema.index({ url: 1, timestamp: -1 });
webVitalsSchema.index({ rating: 1 });

module.exports = mongoose.model('WebVitals', webVitalsSchema, 'web_vitals');
