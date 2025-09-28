const WebVitals = require('../models/WebVitals');

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

// 其他方法：getWebVitalsById, updateWebVitals, deleteWebVitals...
