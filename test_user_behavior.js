// 测试用户行为监控API
// 运行前请确保服务器已启动: node index.js

const testData = {
  behaviorId: 'YnV0dG9uX2NsaWNr', // base64编码的行为ID
  type: 'click',
  action: 'button_click_submit_order',
  userId: 'user_12345',
  sessionId: 'session_67890',
  url: 'http://localhost:3000/checkout',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timestamp: Date.now(),
  pageLoadTime: 2500,
  level: 'high',
  customData: {
    targetElement: 'submit-btn',
    targetClass: 'btn btn-primary',
    targetText: '提交订单',
    productId: 'prod_123',
    quantity: 2,
    discount: 50,
    shippingMethod: 'express',
    campaign: 'summer_sale',
    source: 'google_ads',
    medium: 'cpc',
  },
};

// 测试函数
async function testUserBehaviorAPI() {
  const baseURL = 'http://localhost:3000/monitor/behaviors';

  console.log('🚀 开始测试用户行为监控API...\n');

  try {
    // 1. 测试创建用户行为记录
    console.log('1. 测试创建用户行为记录...');
    const createResponse = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const createResult = await createResponse.json();
    console.log('✅ 创建用户行为记录成功:', createResult);

    if (createResult.data && createResult.data._id) {
      const behaviorId = createResult.data._id;
      console.log(`📝 行为记录ID: ${behaviorId}\n`);

      // 2. 测试获取用户行为详情
      console.log('2. 测试获取用户行为详情...');
      const getResponse = await fetch(`${baseURL}/${behaviorId}`);
      const getResult = await getResponse.json();
      console.log('✅ 获取用户行为详情成功:', getResult);
    }

    // 3. 测试获取用户行为列表
    console.log('\n3. 测试获取用户行为列表...');
    const listResponse = await fetch(
      `${baseURL}?pageNo=1&pageSize=5&type=click`
    );
    const listResult = await listResponse.json();
    console.log('✅ 获取用户行为列表成功:', listResult);
    console.log(
      '📋 行为列表数据:',
      listResult.data?.list?.length || 0,
      '条记录'
    );

    // 4. 测试获取用户行为统计
    console.log('\n4. 测试获取用户行为统计...');
    const statsResponse = await fetch(`${baseURL}/stats`);
    const statsResult = await statsResponse.json();
    console.log('✅ 获取用户行为统计成功:', statsResult);

    // 5. 测试获取热门用户行为
    console.log('\n5. 测试获取热门用户行为...');
    const topResponse = await fetch(`${baseURL}/top?limit=3`);
    const topResult = await topResponse.json();
    console.log('✅ 获取热门用户行为成功:', topResult);

    // 6. 测试批量创建用户行为
    console.log('\n6. 测试批量创建用户行为...');
    const batchData = {
      behaviors: [
        {
          behaviorId: 'c2Nyb2xsX3BhZ2U=',
          type: 'scroll',
          action: 'page_scroll_products',
          userId: 'user_12345',
          sessionId: 'session_67890',
          url: 'http://localhost:3000/products',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: Date.now() - 1000,
          pageLoadTime: 1800,
          level: 'medium',
          customData: {
            scrollDepth: 300,
            category: 'browsing',
            label: 'product_list',
          },
        },
        {
          behaviorId: 'aW5wdXRfc2VhcmNo',
          type: 'input',
          action: 'search_input_keyword',
          userId: 'user_12345',
          sessionId: 'session_67890',
          url: 'http://localhost:3000/search',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: Date.now() - 2000,
          pageLoadTime: 1500,
          level: 'high',
          customData: {
            searchKeyword: '手机',
            inputValue: '手机',
            category: 'search',
            label: 'product_search',
          },
        },
        {
          behaviorId: 'cGFnZV92aWV3X2hvbWU=',
          type: 'page_view',
          action: 'page_view_homepage',
          userId: 'user_12345',
          sessionId: 'session_67890',
          url: 'http://localhost:3000/home',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: Date.now() - 3000,
          pageLoadTime: 2000,
          level: 'medium',
          customData: {
            title: '首页',
            referrer: 'https://www.google.com',
            category: 'navigation',
            label: 'homepage',
          },
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
    console.log('✅ 批量创建用户行为成功:', batchResult);

    // 7. 测试获取用户行为路径分析
    console.log('\n7. 测试获取用户行为路径分析...');
    const pathsResponse = await fetch(
      `${baseURL}/paths?userId=user_12345&limit=5`
    );
    const pathsResult = await pathsResponse.json();
    console.log('✅ 获取用户行为路径成功:', pathsResult);

    // 8. 测试获取漏斗分析数据（基于URL路径）
    console.log('\n8. 测试获取漏斗分析数据...');
    const funnelResponse = await fetch(
      `${baseURL}/funnel?urls=home,products,checkout`
    );
    const funnelResult = await funnelResponse.json();
    console.log('✅ 获取漏斗分析数据成功:', funnelResult);

    // 9. 测试获取热力图数据
    console.log('\n9. 测试获取热力图数据...');
    const heatmapResponse = await fetch(
      `${baseURL}/heatmap?url=localhost:3000&type=click`
    );
    const heatmapResult = await heatmapResponse.json();
    console.log('✅ 获取热力图数据成功:', heatmapResult);

    console.log('\n🎉 所有用户行为监控API测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  const fetch = require('node-fetch');
  testUserBehaviorAPI();
} else {
  // 浏览器环境
  testUserBehaviorAPI();
}

// 导出测试函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testUserBehaviorAPI, testData };
}
