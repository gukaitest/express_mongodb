const WebVitals = require('../models/WebVitals');
const ErrorMonitor = require('../models/ErrorMonitor');

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

// 其他方法：getWebVitalsById, updateWebVitals, deleteWebVitals...
