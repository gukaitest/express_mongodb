const WebVitals = require('../models/WebVitals');
const ErrorMonitor = require('../models/ErrorMonitor');
const UserBehavior = require('../models/UserBehavior');

exports.reportWebVitals = async (req, res) => {
  try {
    // 对 MemoryLeak 数据进行特殊处理
    if (req.body.name === 'MemoryLeak') {
      // 验证 MemoryLeak 特定字段
      if (req.body.memoryUsage && req.body.memoryLimit) {
        // 计算内存使用率
        const memoryUsagePercent =
          (req.body.memoryUsage / req.body.memoryLimit) * 100;

        // 根据内存使用率设置 rating
        if (memoryUsagePercent < 70) {
          req.body.rating = 'good';
        } else if (memoryUsagePercent < 90) {
          req.body.rating = 'needs-improvement';
        } else {
          req.body.rating = 'poor';
        }
      }

      // 如果提供了 performanceMemory 数据，进行额外验证
      if (req.body.performanceMemory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
          req.body.performanceMemory;

        // 确保数据有效性
        if (usedJSHeapSize && totalJSHeapSize && jsHeapSizeLimit) {
          const heapUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;

          // 如果堆使用率过高，调整 rating
          if (heapUsagePercent > 90 && req.body.rating !== 'poor') {
            req.body.rating = 'poor';
          }
        }
      }

      // console.log('MemoryLeak 数据上报:', {
      //   name: req.body.name,
      //   memoryUsage: req.body.memoryUsage,
      //   leakType: req.body.leakType,
      //   rating: req.body.rating,
      // });
    }

    // 对 MemoryLeakSummary 数据进行特殊处理
    if (req.body.name === 'MemoryLeakSummary') {
      // 验证 MemoryLeakSummary 特定字段
      if (req.body.summaryData) {
        const { totalLeaks, totalLeakSize, avgMemoryUsage, peakMemoryUsage } =
          req.body.summaryData;

        // 根据汇总数据设置 rating
        if (avgMemoryUsage && peakMemoryUsage) {
          const avgMemoryUsagePercent =
            (avgMemoryUsage / (peakMemoryUsage || avgMemoryUsage)) * 100;

          // 根据平均内存使用率设置 rating
          if (avgMemoryUsagePercent < 70) {
            req.body.rating = 'good';
          } else if (avgMemoryUsagePercent < 90) {
            req.body.rating = 'needs-improvement';
          } else {
            req.body.rating = 'poor';
          }
        }

        // 如果有泄漏数据，进一步评估
        if (totalLeaks && totalLeakSize) {
          // 根据泄漏严重程度调整 rating
          if (totalLeaks > 100 || totalLeakSize > 50 * 1024 * 1024) {
            // 超过100个泄漏或50MB
            req.body.rating = 'poor';
          } else if (totalLeaks > 50 || totalLeakSize > 20 * 1024 * 1024) {
            // 超过50个泄漏或20MB
            if (req.body.rating !== 'poor') {
              req.body.rating = 'needs-improvement';
            }
          }
        }
      }

      // console.log('MemoryLeakSummary 数据上报:', {
      //   name: req.body.name,
      //   totalLeaks: req.body.summaryData?.totalLeaks,
      //   totalLeakSize: req.body.summaryData?.totalLeakSize,
      //   rating: req.body.rating,
      // });
    }

    const webVitalsData = await WebVitals.create(req.body);
    // console.log('上传接口调用', req.body);
    res.status(201).json(webVitalsData);
  } catch (err) {
    // 打印详细的错误信息
    // console.error('WebVitals创建失败 - 详细错误信息:');
    // console.error('错误类型:', err.name);
    // console.error('错误消息:', err.message);
    // console.error('错误堆栈:', err.stack);

    // 如果是验证错误，打印具体的验证错误详情
    if (err.name === 'ValidationError') {
      console.error('验证错误详情:');
      Object.keys(err.errors).forEach((key) => {
        console.error(`字段 ${key}:`, err.errors[key].message);
      });
    }

    // 如果是重复键错误
    if (err.code === 11000) {
      console.error('重复键错误:', err.keyValue);
    }

    res.status(400).json({
      error: err.message,
      details: err.name === 'ValidationError' ? err.errors : undefined,
    });
  }
};

exports.getWebVitalsStats = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search ? { name: { $regex: new RegExp(search, 'i') } } : {};
    const [list, total] = await Promise.all([
      WebVitals.find(query).skip(skip).limit(limit),
      WebVitals.countDocuments(query),
    ]);

    res.json({
      code: '0000',
      msg: '请求成功',
      data: { list, total, page, pageSize: limit },
    });
  } catch (err) {
    // 打印详细的错误信息
    console.error('获取WebVitals统计失败 - 详细错误信息:');
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    console.error('查询参数:', { page, limit, skip, search });

    res.status(500).json({
      error: err.message,
      details: err.name,
    });
  }
};

// 获取 MemoryLeak 统计数据
exports.getMemoryLeakStats = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;
    const leakType = req.query.leakType || '';
    const rating = req.query.rating || '';

    // 构建查询条件
    const query = { name: 'MemoryLeak' };

    if (leakType) {
      query.leakType = leakType;
    }

    if (rating) {
      query.rating = rating;
    }

    const [list, total] = await Promise.all([
      WebVitals.find(query)
        .select(
          'name value rating memoryUsage memoryLimit leakType leakSize leakCount performanceMemory timestamp url created_at'
        )
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      WebVitals.countDocuments(query),
    ]);

    // 计算统计信息
    const stats = await WebVitals.aggregate([
      { $match: { name: 'MemoryLeak' } },
      {
        $group: {
          _id: null,
          totalLeaks: { $sum: 1 },
          avgMemoryUsage: { $avg: '$memoryUsage' },
          maxMemoryUsage: { $max: '$memoryUsage' },
          avgLeakSize: { $avg: '$leakSize' },
          totalLeakSize: { $sum: '$leakSize' },
          leakTypeStats: {
            $push: {
              leakType: '$leakType',
              memoryUsage: '$memoryUsage',
              rating: '$rating',
            },
          },
        },
      },
    ]);

    // 按泄漏类型分组统计
    const leakTypeStats = await WebVitals.aggregate([
      { $match: { name: 'MemoryLeak' } },
      {
        $group: {
          _id: '$leakType',
          count: { $sum: 1 },
          avgMemoryUsage: { $avg: '$memoryUsage' },
          avgLeakSize: { $avg: '$leakSize' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      code: '0000',
      msg: '请求成功',
      data: {
        list,
        total,
        page,
        pageSize: limit,
        stats: stats[0] || {},
        leakTypeStats,
      },
    });
  } catch (err) {
    console.error('获取MemoryLeak统计失败 - 详细错误信息:');
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);

    res.status(500).json({
      error: err.message,
      details: err.name,
    });
  }
};

// 获取 MemoryLeakSummary 统计数据
exports.getMemoryLeakSummaryStats = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;
    const rating = req.query.rating || '';
    const timeRange = req.query.timeRange || '';

    // 构建查询条件
    const query = { name: 'MemoryLeakSummary' };

    if (rating) {
      query.rating = rating;
    }

    // 时间范围筛选
    if (timeRange) {
      const now = Date.now();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      if (timeRanges[timeRange]) {
        query.timestamp = { $gte: now - timeRanges[timeRange] };
      }
    }

    const [list, total] = await Promise.all([
      WebVitals.find(query)
        .select('name value rating summaryData timestamp url created_at')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      WebVitals.countDocuments(query),
    ]);

    // 计算汇总统计信息
    const stats = await WebVitals.aggregate([
      { $match: { name: 'MemoryLeakSummary' } },
      {
        $group: {
          _id: null,
          totalSummaries: { $sum: 1 },
          avgTotalLeaks: { $avg: '$summaryData.totalLeaks' },
          maxTotalLeaks: { $max: '$summaryData.totalLeaks' },
          avgTotalLeakSize: { $avg: '$summaryData.totalLeakSize' },
          maxTotalLeakSize: { $max: '$summaryData.totalLeakSize' },
          avgMemoryUsage: { $avg: '$summaryData.avgMemoryUsage' },
          peakMemoryUsage: { $max: '$summaryData.peakMemoryUsage' },
        },
      },
    ]);

    // 按评级分组统计
    const ratingStats = await WebVitals.aggregate([
      { $match: { name: 'MemoryLeakSummary' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
          avgTotalLeaks: { $avg: '$summaryData.totalLeaks' },
          avgTotalLeakSize: { $avg: '$summaryData.totalLeakSize' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 内存趋势统计
    const trendStats = await WebVitals.aggregate([
      { $match: { name: 'MemoryLeakSummary' } },
      {
        $group: {
          _id: '$summaryData.memoryTrend',
          count: { $sum: 1 },
          avgTotalLeaks: { $avg: '$summaryData.totalLeaks' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      code: '0000',
      msg: '请求成功',
      data: {
        list,
        total,
        page,
        pageSize: limit,
        stats: stats[0] || {},
        ratingStats,
        trendStats,
      },
    });
  } catch (err) {
    console.error('获取MemoryLeakSummary统计失败 - 详细错误信息:');
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);

    res.status(500).json({
      error: err.message,
      details: err.name,
    });
  }
};

// ============== 错误监控相关方法 ==============

// 错误类型映射函数
const mapErrorType = (type) => {
  const typeMapping = {
    ajax: 'network', // AJAX错误映射为网络错误
    fetch: 'network', // Fetch错误映射为网络错误
    xhr: 'network', // XMLHttpRequest错误映射为网络错误
    http: 'network', // HTTP错误映射为网络错误
    api: 'network', // API错误映射为网络错误
  };

  return typeMapping[type] || type;
};

// 创建错误记录
exports.createError = async (req, res) => {
  try {
    const errorData = {
      ...req.body,
      // 使用类型映射函数处理错误类型
      type: mapErrorType(req.body.type),
      timestamp: req.body.timestamp || Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const error = await ErrorMonitor.create(errorData);
    res.status(201).json({
      code: '0000',
      msg: '错误记录创建成功',
      data: error,
    });
  } catch (err) {
    res.status(400).json({
      code: '4001',
      msg: '创建失败',
      error: err.message,
    });
  }
};

// 批量创建错误记录
exports.createBatchErrors = async (req, res) => {
  try {
    const { errors } = req.body;

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({
        code: '4001',
        msg: '错误数据格式不正确',
      });
    }

    const errorData = errors.map((error) => ({
      ...error,
      // 使用类型映射函数处理错误类型
      type: mapErrorType(error.type),
      timestamp: error.timestamp || Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const createdErrors = await ErrorMonitor.insertMany(errorData);

    res.status(201).json({
      code: '0000',
      msg: '批量错误记录创建成功',
      data: {
        count: createdErrors.length,
        errors: createdErrors,
      },
    });
  } catch (err) {
    res.status(400).json({
      code: '4001',
      msg: '批量创建失败',
      error: err.message,
    });
  }
};

// 获取错误列表
exports.getErrors = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};

    // 错误类型筛选
    if (req.query.type) {
      query.type = req.query.type;
    }

    // 严重程度筛选
    if (req.query.level) {
      query.level = req.query.level;
    }

    // 状态筛选
    if (req.query.status) {
      query.status = req.query.status;
    }

    // URL筛选
    if (req.query.url) {
      query.url = { $regex: new RegExp(req.query.url, 'i') };
    }

    // 错误消息搜索
    if (req.query.search) {
      query.message = { $regex: new RegExp(req.query.search, 'i') };
    }

    // 时间范围筛选
    if (req.query.startTime && req.query.endTime) {
      query.timestamp = {
        $gte: parseInt(req.query.startTime),
        $lte: parseInt(req.query.endTime),
      };
    }

    // 用户ID筛选
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    const [errors, total] = await Promise.all([
      ErrorMonitor.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      ErrorMonitor.countDocuments(query),
    ]);

    res.json({
      code: '0000',
      msg: '请求成功',
      data: {
        list: errors,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 根据ID获取错误详情
exports.getErrorById = async (req, res) => {
  try {
    const error = await ErrorMonitor.findById(req.params.id);

    if (!error) {
      return res.status(404).json({
        code: '4004',
        msg: '错误记录不存在',
      });
    }

    res.json({
      code: '0000',
      msg: '请求成功',
      data: error,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 更新错误状态
exports.updateErrorStatus = async (req, res) => {
  try {
    const { status, tags } = req.body;

    const updateData = { updated_at: new Date() };
    if (status) updateData.status = status;
    if (tags) updateData.tags = tags;

    const error = await ErrorMonitor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!error) {
      return res.status(404).json({
        code: '4004',
        msg: '错误记录不存在',
      });
    }

    res.json({
      code: '0000',
      msg: '状态更新成功',
      data: error,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 删除错误记录
exports.deleteError = async (req, res) => {
  try {
    const error = await ErrorMonitor.findByIdAndDelete(req.params.id);

    if (!error) {
      return res.status(404).json({
        code: '4004',
        msg: '错误记录不存在',
      });
    }

    res.json({
      code: '0000',
      msg: '删除成功',
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取错误统计信息
exports.getErrorStats = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    const matchQuery = {};
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const stats = await ErrorMonitor.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalErrors: { $sum: 1 },
          uniqueErrors: { $addToSet: '$message' },
          errorTypes: {
            $push: {
              type: '$type',
              level: '$level',
            },
          },
          levelCounts: {
            $push: '$level',
          },
          statusCounts: {
            $push: '$status',
          },
        },
      },
      {
        $project: {
          totalErrors: 1,
          uniqueErrorCount: { $size: '$uniqueErrors' },
          errorTypeStats: {
            $reduce: {
              input: '$errorTypes',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.type',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this.type', false] },
                              { $add: ['$$value.$$this.type', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
          levelStats: {
            $reduce: {
              input: '$levelCounts',
              initialValue: { low: 0, medium: 0, high: 0, critical: 0 },
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this', false] },
                              { $add: ['$$value.$$this', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
          statusStats: {
            $reduce: {
              input: '$statusCounts',
              initialValue: {
                new: 0,
                investigating: 0,
                resolved: 0,
                ignored: 0,
              },
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this', false] },
                              { $add: ['$$value.$$this', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    res.json({
      code: '0000',
      msg: '统计信息获取成功',
      data: stats[0] || {
        totalErrors: 0,
        uniqueErrorCount: 0,
        errorTypeStats: {},
        levelStats: { low: 0, medium: 0, high: 0, critical: 0 },
        statusStats: { new: 0, investigating: 0, resolved: 0, ignored: 0 },
      },
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取热门错误（按频率排序）
exports.getTopErrors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { startTime, endTime } = req.query;

    const matchQuery = {};
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const topErrors = await ErrorMonitor.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            message: '$message',
            type: '$type',
            url: '$url',
          },
          count: { $sum: 1 },
          level: { $first: '$level' },
          status: { $first: '$status' },
          lastOccurred: { $max: '$timestamp' },
          firstOccurred: { $min: '$timestamp' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          message: '$_id.message',
          type: '$_id.type',
          url: '$_id.url',
          count: 1,
          level: 1,
          status: 1,
          lastOccurred: 1,
          firstOccurred: 1,
          frequency: {
            $divide: [
              '$count',
              {
                $divide: [
                  { $subtract: ['$lastOccurred', '$firstOccurred'] },
                  86400000,
                ],
              },
            ],
          }, // 每天平均错误次数
        },
      },
    ]);

    res.json({
      code: '0000',
      msg: '热门错误获取成功',
      data: topErrors,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// ============== 用户行为监控相关方法 ==============

// 创建用户行为记录
exports.createUserBehavior = async (req, res) => {
  try {
    const behaviorData = {
      ...req.body,
      timestamp: req.body.timestamp || Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const behavior = await UserBehavior.create(behaviorData);
    res.status(201).json({
      code: '0000',
      msg: '用户行为记录创建成功',
      data: behavior,
    });
  } catch (err) {
    res.status(400).json({
      code: '4001',
      msg: '创建失败',
      error: err.message,
    });
  }
};

// 批量创建用户行为记录
exports.createBatchUserBehaviors = async (req, res) => {
  try {
    const { behaviors } = req.body;

    if (!Array.isArray(behaviors) || behaviors.length === 0) {
      return res.status(400).json({
        code: '4001',
        msg: '用户行为数据格式不正确',
      });
    }

    const behaviorData = behaviors.map((behavior) => ({
      ...behavior,
      timestamp: behavior.timestamp || Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const createdBehaviors = await UserBehavior.insertMany(behaviorData);

    res.status(201).json({
      code: '0000',
      msg: '批量用户行为记录创建成功',
      data: {
        count: createdBehaviors.length,
        behaviors: createdBehaviors,
      },
    });
  } catch (err) {
    res.status(400).json({
      code: '4001',
      msg: '批量创建失败',
      error: err.message,
    });
  }
};

// 获取用户行为列表
exports.getUserBehaviors = async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};

    // 行为类型筛选
    if (req.query.type) {
      query.type = req.query.type;
    }

    // 用户ID筛选
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    // 会话ID筛选
    if (req.query.sessionId) {
      query.sessionId = req.query.sessionId;
    }

    // URL筛选
    if (req.query.url) {
      query.url = { $regex: new RegExp(req.query.url, 'i') };
    }

    // 行为动作筛选
    if (req.query.action) {
      query.action = req.query.action;
    }

    // 重要级别筛选
    if (req.query.level) {
      query.level = req.query.level;
    }

    // 时间范围筛选
    if (req.query.startTime && req.query.endTime) {
      query.timestamp = {
        $gte: parseInt(req.query.startTime),
        $lte: parseInt(req.query.endTime),
      };
    }

    const [behaviors, total] = await Promise.all([
      UserBehavior.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      UserBehavior.countDocuments(query),
    ]);

    res.json({
      code: '0000',
      msg: '请求成功',
      data: {
        list: behaviors,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 根据ID获取用户行为详情
exports.getUserBehaviorById = async (req, res) => {
  try {
    const behavior = await UserBehavior.findById(req.params.id);

    if (!behavior) {
      return res.status(404).json({
        code: '4004',
        msg: '用户行为记录不存在',
      });
    }

    res.json({
      code: '0000',
      msg: '请求成功',
      data: behavior,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取用户行为统计信息
exports.getUserBehaviorStats = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    const matchQuery = {};
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const stats = await UserBehavior.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          behaviorTypes: { $push: '$type' },
          actions: { $push: '$action' },
          levels: { $push: '$level' },
          avgPageLoadTime: { $avg: '$pageLoadTime' },
          maxPageLoadTime: { $max: '$pageLoadTime' },
          minPageLoadTime: { $min: '$pageLoadTime' },
        },
      },
      {
        $project: {
          totalEvents: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          avgPageLoadTime: 1,
          maxPageLoadTime: 1,
          minPageLoadTime: 1,
          typeStats: {
            $reduce: {
              input: '$behaviorTypes',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this', false] },
                              { $add: ['$$value.$$this', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
          actionStats: {
            $reduce: {
              input: '$actions',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this', false] },
                              { $add: ['$$value.$$this', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
          levelStats: {
            $reduce: {
              input: '$levels',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $cond: [
                              { $ifNull: ['$$value.$$this', false] },
                              { $add: ['$$value.$$this', 1] },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    res.json({
      code: '0000',
      msg: '统计信息获取成功',
      data: stats[0] || {
        totalEvents: 0,
        uniqueUserCount: 0,
        uniqueSessionCount: 0,
        avgPageLoadTime: 0,
        maxPageLoadTime: 0,
        minPageLoadTime: 0,
        typeStats: {},
        actionStats: {},
        levelStats: {},
      },
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取热门用户行为（按频率排序）
exports.getTopUserBehaviors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { startTime, endTime } = req.query;

    const matchQuery = {};
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const topBehaviors = await UserBehavior.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            type: '$type',
            action: '$action',
            url: '$url',
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          lastOccurred: { $max: '$timestamp' },
          firstOccurred: { $min: '$timestamp' },
          avgPageLoadTime: { $avg: '$pageLoadTime' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          type: '$_id.type',
          action: '$_id.action',
          url: '$_id.url',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          lastOccurred: 1,
          firstOccurred: 1,
          avgPageLoadTime: 1,
          frequency: {
            $divide: [
              '$count',
              {
                $divide: [
                  { $subtract: ['$lastOccurred', '$firstOccurred'] },
                  86400000,
                ],
              },
            ],
          }, // 每天平均事件次数
        },
      },
    ]);

    res.json({
      code: '0000',
      msg: '热门用户行为获取成功',
      data: topBehaviors,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取用户行为路径分析
exports.getUserBehaviorPaths = async (req, res) => {
  try {
    const { userId, sessionId, startTime, endTime } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const matchQuery = {};
    if (userId) matchQuery.userId = userId;
    if (sessionId) matchQuery.sessionId = sessionId;
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const paths = await UserBehavior.aggregate([
      { $match: matchQuery },
      {
        $sort: { timestamp: 1 },
      },
      {
        $group: {
          _id: sessionId ? '$sessionId' : '$userId',
          userId: { $first: '$userId' },
          events: {
            $push: {
              type: '$type',
              action: '$action',
              url: '$url',
              timestamp: '$timestamp',
              pageLoadTime: '$pageLoadTime',
              level: '$level',
            },
          },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' },
          totalEvents: { $sum: 1 },
          totalPageLoadTime: { $sum: '$pageLoadTime' },
        },
      },
      {
        $project: {
          sessionId: '$_id',
          userId: 1,
          events: 1,
          startTime: 1,
          endTime: 1,
          totalEvents: 1,
          totalPageLoadTime: 1,
          avgPageLoadTime: {
            $cond: [
              { $gt: ['$totalEvents', 0] },
              { $divide: ['$totalPageLoadTime', '$totalEvents'] },
              0,
            ],
          },
          duration: { $subtract: ['$endTime', '$startTime'] },
        },
      },
      {
        $sort: { startTime: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    res.json({
      code: '0000',
      msg: '用户行为路径获取成功',
      data: paths,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取漏斗分析数据（简化版本，基于URL路径）
exports.getFunnelAnalysis = async (req, res) => {
  try {
    const { urls, startTime, endTime } = req.query;

    if (!urls) {
      return res.status(400).json({
        code: '4001',
        msg: 'URL列表不能为空（使用逗号分隔多个URL）',
      });
    }

    const urlList = urls.split(',').map((url) => url.trim());
    const matchQuery = {};

    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    // 基于URL分析用户路径转化
    const funnelStats = [];

    for (let i = 0; i < urlList.length; i++) {
      const stepUrl = urlList[i];
      const stepQuery = {
        ...matchQuery,
        url: { $regex: new RegExp(stepUrl, 'i') },
      };

      const stepData = await UserBehavior.aggregate([
        { $match: stepQuery },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueSessions: { $addToSet: '$sessionId' },
          },
        },
      ]);

      const data = stepData[0] || {
        count: 0,
        uniqueUsers: [],
        uniqueSessions: [],
      };

      funnelStats.push({
        step: i + 1,
        url: stepUrl,
        count: data.count,
        uniqueUserCount: data.uniqueUsers.length,
        uniqueSessionCount: data.uniqueSessions.length,
      });
    }

    // 计算转化率和流失率
    const enrichedStats = funnelStats.map((step, index) => {
      const previousStep = index > 0 ? funnelStats[index - 1] : null;
      const conversionRate = previousStep
        ? (step.count / previousStep.count) * 100
        : 100;
      const dropOffRate = previousStep
        ? ((previousStep.count - step.count) / previousStep.count) * 100
        : 0;

      return {
        ...step,
        conversionRate: conversionRate.toFixed(2),
        dropOffRate: dropOffRate.toFixed(2),
        dropOffCount: previousStep ? previousStep.count - step.count : 0,
      };
    });

    res.json({
      code: '0000',
      msg: '漏斗分析数据获取成功',
      data: {
        steps: enrichedStats,
        totalSteps: enrichedStats.length,
        overallConversionRate:
          enrichedStats.length > 0 && funnelStats[0].count > 0
            ? (
                (funnelStats[funnelStats.length - 1].count /
                  funnelStats[0].count) *
                100
              ).toFixed(2)
            : '0.00',
      },
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 获取热力图数据（简化版本，基于URL和行为类型）
exports.getHeatmapData = async (req, res) => {
  try {
    const { url, type, startTime, endTime } = req.query;

    const matchQuery = {};
    if (url) matchQuery.url = { $regex: new RegExp(url, 'i') };
    if (type) matchQuery.type = type;
    if (startTime && endTime) {
      matchQuery.timestamp = {
        $gte: parseInt(startTime),
        $lte: parseInt(endTime),
      };
    }

    const heatmapData = await UserBehavior.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            url: '$url',
            type: '$type',
            action: '$action',
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          avgPageLoadTime: { $avg: '$pageLoadTime' },
        },
      },
      {
        $project: {
          url: '$_id.url',
          type: '$_id.type',
          action: '$_id.action',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          avgPageLoadTime: 1,
          intensity: {
            $cond: [
              { $gte: ['$count', 100] },
              'high',
              {
                $cond: [{ $gte: ['$count', 50] }, 'medium', 'low'],
              },
            ],
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 100,
      },
    ]);

    res.json({
      code: '0000',
      msg: '热力图数据获取成功',
      data: heatmapData,
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 删除用户行为记录
exports.deleteUserBehavior = async (req, res) => {
  try {
    const behavior = await UserBehavior.findByIdAndDelete(req.params.id);

    if (!behavior) {
      return res.status(404).json({
        code: '4004',
        msg: '用户行为记录不存在',
      });
    }

    res.json({
      code: '0000',
      msg: '删除成功',
    });
  } catch (err) {
    res.status(500).json({
      code: '5000',
      msg: '服务器错误',
      error: err.message,
    });
  }
};

// 其他方法：getWebVitalsById, updateWebVitals, deleteWebVitals...
