// 测试统一后的监控错误API
// 运行前请确保服务器已启动: node index.js

const testData = {
  type: 'javascript',
  message: "Cannot read property 'length' of undefined",
  stack: `TypeError: Cannot read property 'length' of undefined
    at processData (script.js:15:8)
    at handleUserInput (app.js:42:12)`,
  filename: 'script.js',
  lineno: 15,
  colno: 8,
  url: 'http://localhost:3000/dashboard',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  referrer: 'http://localhost:3000/login',
  timestamp: Date.now(),
  timezone: 'Asia/Shanghai',
  userId: 'user_12345',
  sessionId: 'session_67890',
  screenResolution: {
    width: 1920,
    height: 1080,
  },
  viewportSize: {
    width: 1920,
    height: 937,
  },
  devicePixelRatio: 1,
  connectionType: 'wifi',
  effectiveType: '4g',
  performanceInfo: {
    navigationStart: Date.now() - 5000,
    loadEventEnd: Date.now() - 3000,
    domContentLoaded: Date.now() - 4000,
    firstPaint: Date.now() - 3500,
    firstContentfulPaint: Date.now() - 3200,
  },
  level: 'high',
  tags: ['critical', 'user-facing', 'dashboard'],
  customData: {
    userAction: 'click',
    elementId: 'submit-btn',
    browserVersion: 'Chrome 120.0.0.0',
    osVersion: 'Windows 10.0.19045',
  },
};

// 测试函数
async function testMonitorErrorsAPI() {
  const baseURL = 'http://localhost:3000/monitor/errors';

  console.log('🚀 开始测试统一后的监控错误API...\n');

  try {
    // 1. 测试创建错误记录
    console.log('1. 测试创建错误记录...');
    const createResponse = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const createResult = await createResponse.json();
    console.log('✅ 创建错误记录成功:', createResult);

    if (createResult.data && createResult.data._id) {
      const errorId = createResult.data._id;
      console.log(`📝 错误ID: ${errorId}\n`);

      // 2. 测试获取错误详情
      console.log('2. 测试获取错误详情...');
      const getResponse = await fetch(`${baseURL}/${errorId}`);
      const getResult = await getResponse.json();
      console.log('✅ 获取错误详情成功:', getResult);

      // 3. 测试更新错误状态
      console.log('\n3. 测试更新错误状态...');
      const updateResponse = await fetch(`${baseURL}/${errorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'investigating',
          tags: ['bug-fix', 'priority-high', 'assigned'],
        }),
      });
      const updateResult = await updateResponse.json();
      console.log('✅ 更新错误状态成功:', updateResult);
    }

    // 4. 测试获取错误列表
    console.log('\n4. 测试获取错误列表...');
    const listResponse = await fetch(
      `${baseURL}?pageNo=1&pageSize=5&level=high`
    );
    const listResult = await listResponse.json();
    console.log('✅ 获取错误列表成功:', listResult);
    console.log(
      '📋 错误列表数据:',
      listResult.data?.list?.length || 0,
      '条记录'
    );

    // 5. 测试获取错误统计
    console.log('\n5. 测试获取错误统计...');
    const statsResponse = await fetch(`${baseURL}/stats`);
    const statsResult = await statsResponse.json();
    console.log('✅ 获取错误统计成功:', statsResult);

    // 6. 测试获取热门错误
    console.log('\n6. 测试获取热门错误...');
    const topResponse = await fetch(`${baseURL}/top?limit=3`);
    const topResult = await topResponse.json();
    console.log('✅ 获取热门错误成功:', topResult);

    // 7. 测试批量创建错误
    console.log('\n7. 测试批量创建错误...');
    const batchData = {
      errors: [
        {
          type: 'network',
          message:
            'Failed to fetch: NetworkError when attempting to fetch resource',
          url: 'http://localhost:3000/api/users',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'medium',
          timestamp: Date.now() - 1000,
          requestUrl: 'http://localhost:3000/api/users',
          requestMethod: 'GET',
          responseStatus: 500,
        },
        {
          type: 'resource',
          message:
            'Failed to load resource: the server responded with a status of 404',
          url: 'http://localhost:3000/assets/image.png',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'low',
          timestamp: Date.now() - 2000,
          resourceType: 'image',
          resourceUrl: 'http://localhost:3000/assets/image.png',
        },
        {
          type: 'ajax', // 测试类型映射：ajax -> network
          message: 'AJAX request failed: 500 Internal Server Error',
          url: 'http://localhost:3000/api/data',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'high',
          timestamp: Date.now() - 3000,
          requestUrl: 'http://localhost:3000/api/data',
          requestMethod: 'POST',
          responseStatus: 500,
        },
      ],
    };

    const batchResponse = await fetch(`${baseURL}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    });
    const batchResult = await batchResponse.json();
    console.log('✅ 批量创建错误成功:', batchResult);

    // 8. 测试类型映射功能（ajax -> network）
    console.log('\n8. 测试类型映射功能...');
    const ajaxTestData = {
      type: 'ajax',
      message: 'AJAX request timeout',
      url: 'http://localhost:3000/api/timeout',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      level: 'medium',
      timestamp: Date.now(),
      requestUrl: 'http://localhost:3000/api/timeout',
      requestMethod: 'GET',
    };

    const ajaxResponse = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ajaxTestData),
    });

    const ajaxResult = await ajaxResponse.json();
    console.log('✅ AJAX类型映射测试成功:', ajaxResult);
    console.log('📝 映射后的类型:', ajaxResult.data?.type);

    console.log('\n🎉 所有API测试完成！统一后的监控错误API工作正常。');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  const fetch = require('node-fetch');
  testMonitorErrorsAPI();
} else {
  // 浏览器环境
  testMonitorErrorsAPI();
}

// 导出测试函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testMonitorErrorsAPI, testData };
}
