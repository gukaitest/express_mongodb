const WebVitals = require('../models/WebVitals');

exports.reportWebVitals = async (req, res) => {
  try {
    const webVitalsData = await WebVitals.create(req.body);
    console.log('上传接口调用', req.body);
    res.status(201).json(webVitalsData);
  } catch (err) {
    // 打印详细的错误信息
    console.error('WebVitals创建失败 - 详细错误信息:');
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);

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

// 其他方法：getWebVitalsById, updateWebVitals, deleteWebVitals...
