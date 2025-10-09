# 用户行为监控类型定义

本目录包含用户行为监控的类型定义和常量，支持 TypeScript 和 JavaScript。

## 文件说明

- `userBehavior.types.ts` - TypeScript 类型定义文件
- `userBehavior.constants.js` - JavaScript 常量和工具函数

## 使用方法

### TypeScript 项目

```typescript
import {
  UserBehaviorType,
  UserBehaviorLevel,
  UserBehaviorData,
  ApiResponse,
} from './types/userBehavior.types';

// 使用枚举
const behaviorData: UserBehaviorData = {
  behaviorId: 'abc123',
  type: UserBehaviorType.CLICK,
  action: 'button_click',
  sessionId: 'session_123',
  url: 'https://example.com',
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  level: UserBehaviorLevel.HIGH,
  customData: {
    elementId: 'submit-btn',
  },
};

// 发送行为数据
async function sendBehavior(data: UserBehaviorData): Promise<ApiResponse> {
  const response = await fetch('http://localhost:3000/monitor/behaviors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### JavaScript 项目

```javascript
const {
  UserBehaviorType,
  UserBehaviorLevel,
  createUserBehavior,
  generateBehaviorId,
  generateSessionId,
} = require('./types/userBehavior.constants');

// 使用枚举常量
const behaviorData = createUserBehavior({
  behaviorId: generateBehaviorId(UserBehaviorType.CLICK, 'button_click'),
  type: UserBehaviorType.CLICK,
  action: 'button_click',
  sessionId: generateSessionId(),
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  level: UserBehaviorLevel.HIGH,
  customData: {
    elementId: 'submit-btn',
  },
});

// 发送行为数据
async function sendBehavior(data) {
  const response = await fetch('http://localhost:3000/monitor/behaviors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### HTML 页面（通过 script 标签）

```html
<script src="./types/userBehavior.constants.js"></script>
<script>
  // 使用全局变量（如果在浏览器环境中）
  const behaviorData = createUserBehavior({
    behaviorId: generateBehaviorId(UserBehaviorType.PAGE_VIEW, 'page_view'),
    type: UserBehaviorType.PAGE_VIEW,
    action: 'page_view',
    sessionId: generateSessionId(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });
</script>
```

## 用户行为类型枚举

```typescript
enum UserBehaviorType {
  CLICK = 'click', // 点击事件
  SCROLL = 'scroll', // 滚动事件
  INPUT = 'input', // 输入事件
  FOCUS = 'focus', // 焦点事件
  BLUR = 'blur', // 失焦事件
  RESIZE = 'resize', // 窗口大小调整
  NAVIGATION = 'navigation', // 导航事件
  PAGE_VIEW = 'page_view', // 页面浏览
  SESSION_START = 'session_start', // 会话开始
  SESSION_END = 'session_end', // 会话结束
  CUSTOM = 'custom', // 自定义事件
}
```

## 重要程度级别枚举

```typescript
enum UserBehaviorLevel {
  LOW = 'low', // 低
  MEDIUM = 'medium', // 中
  HIGH = 'high', // 高
  CRITICAL = 'critical', // 严重
}
```

## 常用工具函数

### generateBehaviorId(type, action)

生成行为ID（简单的 base64 编码）

**参数:**

- `type` (string): 行为类型
- `action` (string): 行为动作

**返回:** string - 生成的行为ID

**示例:**

```javascript
const id = generateBehaviorId('click', 'button_submit');
// 返回: "Y2xpY2tfYnV0dG9u"
```

### generateSessionId()

生成会话ID

**返回:** string - 生成的会话ID

**示例:**

```javascript
const sessionId = generateSessionId();
// 返回: "session_1759974847959_bol3nztyg"
```

### createUserBehavior(params)

创建用户行为数据对象

**参数:**

- `params` (Object): 包含所有必需和可选字段的参数对象

**返回:** Object - 用户行为数据对象

**示例:**

```javascript
const behavior = createUserBehavior({
  behaviorId: generateBehaviorId('click', 'button_click'),
  type: UserBehaviorType.CLICK,
  action: 'button_click',
  sessionId: generateSessionId(),
  url: 'https://example.com',
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  userId: 'user_123',
  level: UserBehaviorLevel.HIGH,
  customData: { buttonId: 'submit' },
});
```

### isValidBehaviorType(type)

验证行为类型是否有效

**参数:**

- `type` (string): 要验证的行为类型

**返回:** boolean - 是否有效

**示例:**

```javascript
isValidBehaviorType('click'); // true
isValidBehaviorType('invalid'); // false
```

### isValidBehaviorLevel(level)

验证重要程度级别是否有效

**参数:**

- `level` (string): 要验证的重要程度级别

**返回:** boolean - 是否有效

**示例:**

```javascript
isValidBehaviorLevel('high'); // true
isValidBehaviorLevel('invalid'); // false
```

## 完整示例

### 监听页面事件并上报

```javascript
const {
  UserBehaviorType,
  UserBehaviorLevel,
  createUserBehavior,
  generateBehaviorId,
  generateSessionId,
} = require('./types/userBehavior.constants');

// 生成会话ID（页面加载时）
const sessionId = generateSessionId();
const userId = localStorage.getItem('userId') || '';

// 发送行为数据的通用函数
async function sendBehavior(behaviorData) {
  try {
    const response = await fetch('http://localhost:3000/monitor/behaviors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behaviorData),
    });
    return await response.json();
  } catch (error) {
    console.error('发送行为数据失败:', error);
  }
}

// 监听点击事件
document.addEventListener('click', (event) => {
  const behaviorData = createUserBehavior({
    behaviorId: generateBehaviorId(UserBehaviorType.CLICK, 'element_click'),
    type: UserBehaviorType.CLICK,
    action: 'element_click',
    sessionId,
    userId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    level: UserBehaviorLevel.MEDIUM,
    customData: {
      elementId: event.target.id,
      elementClass: event.target.className,
      elementTag: event.target.tagName,
      clickX: event.clientX,
      clickY: event.clientY,
    },
  });

  sendBehavior(behaviorData);
});

// 监听焦点事件
document.addEventListener(
  'focus',
  (event) => {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      const behaviorData = createUserBehavior({
        behaviorId: generateBehaviorId(UserBehaviorType.FOCUS, 'input_focus'),
        type: UserBehaviorType.FOCUS,
        action: 'input_focus',
        sessionId,
        userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        level: UserBehaviorLevel.LOW,
        customData: {
          elementId: event.target.id,
          elementName: event.target.name,
          elementType: event.target.type,
        },
      });

      sendBehavior(behaviorData);
    }
  },
  true
);

// 监听窗口调整事件（防抖）
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const behaviorData = createUserBehavior({
      behaviorId: generateBehaviorId(UserBehaviorType.RESIZE, 'window_resize'),
      type: UserBehaviorType.RESIZE,
      action: 'window_resize',
      sessionId,
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      level: UserBehaviorLevel.LOW,
      customData: {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation:
          window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      },
    });

    sendBehavior(behaviorData);
  }, 500);
});

// 页面加载时记录会话开始
window.addEventListener('load', () => {
  const behaviorData = createUserBehavior({
    behaviorId: generateBehaviorId(
      UserBehaviorType.SESSION_START,
      'session_start'
    ),
    type: UserBehaviorType.SESSION_START,
    action: 'session_start',
    sessionId,
    userId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    pageLoadTime: performance.now(),
    level: UserBehaviorLevel.HIGH,
    customData: {
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
    },
  });

  sendBehavior(behaviorData);
});

// 页面卸载时记录会话结束
window.addEventListener('beforeunload', () => {
  const behaviorData = createUserBehavior({
    behaviorId: generateBehaviorId(UserBehaviorType.SESSION_END, 'session_end'),
    type: UserBehaviorType.SESSION_END,
    action: 'session_end',
    sessionId,
    userId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    level: UserBehaviorLevel.HIGH,
  });

  // 使用 sendBeacon 确保在页面卸载时数据能够发送
  navigator.sendBeacon(
    'http://localhost:3000/monitor/behaviors',
    JSON.stringify(behaviorData)
  );
});
```

## 注意事项

1. 所有枚举值都是小写字符串，例如 `'click'`、`'page_view'` 等
2. `behaviorId` 应该是唯一的，建议使用提供的 `generateBehaviorId` 函数
3. `timestamp` 应该使用毫秒级别的 Unix 时间戳（`Date.now()`）
4. `customData` 可以存储任意额外的数据，但不应存储敏感信息
5. 在页面卸载时发送数据，建议使用 `navigator.sendBeacon` API

## 相关文档

- [用户行为监控字段更新说明](../USER_BEHAVIOR_SCHEMA_UPDATE.md)
- [客户端示例](../client_example.html)
- [测试文件](../test_user_behavior.js)
