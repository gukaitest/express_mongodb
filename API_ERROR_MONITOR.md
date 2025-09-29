# 错误监控 API 文档

## 概述

错误监控接口提供了完整的错误收集、存储、查询和分析功能，支持前端JavaScript错误、网络错误、资源加载错误、Vue组件错误等多种类型的错误监控。

## 基础URL

```
http://localhost:3000/monitor/errors
```

## API 接口

### 1. 创建错误记录

**POST** `/monitor/errors`

创建单个错误记录。

#### 请求体示例

```json
{
  "type": "javascript",
  "level": "high",
  "message": "Cannot read property 'length' of undefined",
  "stack": "TypeError: Cannot read property 'length' of undefined\n    at processData (script.js:15:8)",
  "filename": "script.js",
  "lineno": 15,
  "colno": 8,
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "timestamp": 1703123456789,
  "userId": "user123",
  "sessionId": "session456",
  "componentName": "UserProfile",
  "componentStack": "UserProfile -> App -> RouterView",
  "propsData": {
    "userId": "123",
    "showAvatar": true
  },
  "route": "/user/profile",
  "routeParams": {
    "id": "123"
  },
  "routeQuery": {
    "tab": "settings"
  },
  "resourceType": "script",
  "resourceUrl": "https://example.com/js/app.js",
  "requestUrl": "https://api.example.com/users",
  "requestMethod": "GET",
  "requestData": {
    "page": 1,
    "limit": 10
  },
  "responseStatus": 200,
  "responseData": {
    "users": []
  },
  "customData": {
    "customField": "customValue",
    "userAction": "click",
    "elementId": "submit-btn"
  },
  "errorId": "unique-error-id-for-deduplication"
}
```

#### 响应示例

```json
{
  "code": "0000",
  "msg": "错误记录创建成功",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "javascript",
    "level": "high",
    "message": "Cannot read property 'length' of undefined",
    "url": "https://example.com/page",
    "timestamp": 1703123456789,
    "created_at": "2023-12-21T10:30:56.789Z",
    "updated_at": "2023-12-21T10:30:56.789Z"
  }
}
```

### 2. 批量创建错误记录

**POST** `/monitor/errors/batch`

批量创建多个错误记录。

#### 请求体示例

```json
{
  "errors": [
    {
      "type": "javascript",
      "message": "Error 1",
      "url": "https://example.com/page1",
      "userAgent": "Mozilla/5.0...",
      "level": "medium"
    },
    {
      "type": "network",
      "message": "Failed to fetch resource",
      "url": "https://example.com/page2",
      "userAgent": "Mozilla/5.0...",
      "level": "low"
    }
  ]
}
```

### 3. 获取错误列表

**GET** `/monitor/errors`

获取错误记录列表，支持分页和多种筛选条件。

#### 查询参数

| 参数          | 类型   | 说明                                    |
| ------------- | ------ | --------------------------------------- |
| pageNo        | number | 页码，默认1                             |
| pageSize      | number | 每页数量，默认10                        |
| type          | string | 错误类型筛选                            |
| level         | string | 严重程度筛选 (low/medium/high/critical) |
| url           | string | URL筛选（模糊匹配）                     |
| search        | string | 错误消息搜索                            |
| startTime     | number | 开始时间戳                              |
| endTime       | number | 结束时间戳                              |
| userId        | string | 用户ID筛选                              |
| sessionId     | string | 会话ID筛选                              |
| componentName | string | Vue组件名筛选                           |
| route         | string | 路由筛选                                |

#### 请求示例

```
GET /monitor/errors?pageNo=1&pageSize=20&level=high&type=javascript&startTime=1703123456789&endTime=1703210000000
```

#### 响应示例

```json
{
  "code": "0000",
  "msg": "请求成功",
  "data": {
    "list": [...],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

### 4. 获取错误详情

**GET** `/monitor/errors/:id`

根据ID获取错误记录的详细信息。

### 5. 更新错误状态

**PUT** `/monitor/errors/:id/status`

更新错误记录的状态和标签。

#### 请求体示例

```json
{
  "status": "investigating",
  "tags": ["bug-fix", "priority-high"]
}
```

### 6. 删除错误记录

**DELETE** `/monitor/errors/:id`

删除指定的错误记录。

### 7. 获取错误统计信息

**GET** `/monitor/errors/stats`

获取错误统计信息，包括总数、类型分布、严重程度分布等。

#### 查询参数

| 参数      | 类型   | 说明       |
| --------- | ------ | ---------- |
| startTime | number | 开始时间戳 |
| endTime   | number | 结束时间戳 |

#### 响应示例

```json
{
  "code": "0000",
  "msg": "统计信息获取成功",
  "data": {
    "totalErrors": 1250,
    "uniqueErrorCount": 85,
    "errorTypeStats": {
      "javascript": 800,
      "network": 300,
      "resource": 150,
      "vue": 200
    },
    "levelStats": {
      "low": 400,
      "medium": 600,
      "high": 200,
      "critical": 50
    }
  }
}
```

### 8. 获取热门错误

**GET** `/monitor/errors/top`

获取按频率排序的热门错误。

#### 查询参数

| 参数      | 类型   | 说明             |
| --------- | ------ | ---------------- |
| limit     | number | 返回数量，默认10 |
| startTime | number | 开始时间戳       |
| endTime   | number | 结束时间戳       |

#### 响应示例

```json
{
  "code": "0000",
  "msg": "热门错误获取成功",
  "data": [
    {
      "message": "Cannot read property 'length' of undefined",
      "type": "javascript",
      "url": "https://example.com/page",
      "count": 45,
      "level": "high",
      "lastOccurred": 1703210000000,
      "firstOccurred": 1703123456789,
      "frequency": 4.5
    }
  ]
}
```

## 错误类型说明

| 错误类型           | 说明                 |
| ------------------ | -------------------- |
| javascript         | JavaScript运行时错误 |
| network            | 网络请求错误         |
| resource           | 资源加载错误         |
| promise            | Promise拒绝错误      |
| unhandledrejection | 未处理的Promise拒绝  |
| custom             | 自定义错误           |
| performance        | 性能相关错误         |
| memory             | 内存相关错误         |
| vue                | Vue组件错误          |

## 严重程度说明

| 严重程度 | 说明                       |
| -------- | -------------------------- |
| low      | 低严重程度，不影响核心功能 |
| medium   | 中等严重程度，影响部分功能 |
| high     | 高严重程度，影响重要功能   |
| critical | 严重程度，导致应用崩溃     |

## 字段说明

### 基础信息

- `type`: 错误类型
- `level`: 错误严重程度
- `message`: 错误消息
- `stack`: 错误堆栈信息
- `filename`: 出错文件名
- `lineno`: 出错行号
- `colno`: 出错列号

### 上下文信息

- `url`: 页面URL
- `userAgent`: 用户代理字符串
- `timestamp`: 时间戳
- `userId`: 用户ID
- `sessionId`: 会话ID

### Vue组件相关

- `componentName`: Vue组件名
- `componentStack`: 组件调用栈
- `propsData`: 组件props数据
- `route`: 当前路由
- `routeParams`: 路由参数
- `routeQuery`: 路由查询参数

### 资源错误信息

- `resourceType`: 资源类型
- `resourceUrl`: 资源URL

### 请求错误信息

- `requestUrl`: 请求URL
- `requestMethod`: 请求方法
- `requestData`: 请求数据
- `responseStatus`: 响应状态码
- `responseData`: 响应数据

### 自定义信息

- `customData`: 自定义数据
- `errorId`: 错误ID（用于去重）

## 使用示例

### 前端JavaScript错误监控

```javascript
// 全局错误捕获
window.addEventListener('error', function (event) {
  const errorData = {
    type: 'javascript',
    level: 'medium',
    message: event.message,
    stack: event.error ? event.error.stack : '',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    userId: getCurrentUserId(), // 自定义函数
    sessionId: getSessionId(), // 自定义函数
    customData: {
      userAction: 'page_load',
      browserVersion: navigator.userAgent,
    },
  };

  fetch('/monitor/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorData),
  });
});

// Promise错误捕获
window.addEventListener('unhandledrejection', function (event) {
  const errorData = {
    type: 'unhandledrejection',
    level: 'high',
    message: event.reason
      ? event.reason.toString()
      : 'Unhandled Promise Rejection',
    stack: event.reason && event.reason.stack ? event.reason.stack : '',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    customData: {
      reason: event.reason,
      promise: event.promise,
    },
  };

  fetch('/monitor/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorData),
  });
});

// Vue错误捕获（如果使用Vue）
if (window.Vue) {
  Vue.config.errorHandler = function (err, vm, info) {
    const errorData = {
      type: 'vue',
      level: 'high',
      message: err.message,
      stack: err.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      componentName: vm.$options.name || vm.$options._componentTag,
      componentStack: info,
      propsData: vm.$props,
      route: vm.$route ? vm.$route.path : null,
      routeParams: vm.$route ? vm.$route.params : null,
      routeQuery: vm.$route ? vm.$route.query : null,
      customData: {
        errorInfo: info,
        componentData: vm.$data,
      },
    };

    fetch('/monitor/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });
  };
}
```

## 测试示例

### 1. 创建错误记录测试

```bash
curl -X POST http://localhost:3000/monitor/errors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "javascript",
    "level": "high",
    "message": "Cannot read property '\''length'\'' of undefined",
    "stack": "TypeError: Cannot read property '\''length'\'' of undefined\n    at processData (script.js:15:8)",
    "filename": "script.js",
    "lineno": 15,
    "colno": 8,
    "url": "http://localhost:3000/dashboard",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "timestamp": 1703123456789,
    "customData": {
      "userAction": "click",
      "elementId": "submit-btn"
    }
  }'
```

### 2. 获取错误列表测试

```bash
curl "http://localhost:3000/monitor/errors?pageNo=1&pageSize=10&level=high&type=javascript"
```

### 3. 获取错误统计测试

```bash
curl "http://localhost:3000/monitor/errors/stats"
```

### 4. 获取热门错误测试

```bash
curl "http://localhost:3000/monitor/errors/top?limit=5"
```
