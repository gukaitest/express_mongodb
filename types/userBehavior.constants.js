/**
 * 用户行为监控常量定义（JavaScript 版本）
 */

// 用户行为类型枚举
const UserBehaviorType = {
  CLICK: 'click',
  SCROLL: 'scroll',
  INPUT: 'input',
  FOCUS: 'focus',
  BLUR: 'blur',
  RESIZE: 'resize',
  NAVIGATION: 'navigation',
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  CUSTOM: 'custom',
};

// 用户行为类型值数组
const UserBehaviorTypeValues = Object.values(UserBehaviorType);

// 重要程度级别枚举
const UserBehaviorLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// 重要程度级别值数组
const UserBehaviorLevelValues = Object.values(UserBehaviorLevel);

// API 响应码
const ApiResponseCode = {
  SUCCESS: '0000',
  BAD_REQUEST: '4001',
  NOT_FOUND: '4004',
  SERVER_ERROR: '5000',
};

// 默认配置
const DefaultConfig = {
  API_BASE_URL: 'http://localhost:3000/monitor/behaviors',
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_NO: 1,
  DEFAULT_LEVEL: UserBehaviorLevel.MEDIUM,
};

/**
 * 创建用户行为数据对象
 * @param {Object} params - 参数对象
 * @param {string} params.behaviorId - 行为ID
 * @param {string} params.type - 行为类型
 * @param {string} params.action - 行为动作
 * @param {string} params.sessionId - 会话ID
 * @param {string} params.url - 页面URL
 * @param {string} params.userAgent - 用户代理
 * @param {number} params.timestamp - 时间戳
 * @param {string} [params.userId] - 用户ID（可选）
 * @param {number} [params.pageLoadTime] - 页面加载时间（可选）
 * @param {string} [params.level] - 重要程度（可选）
 * @param {Object} [params.customData] - 自定义数据（可选）
 * @returns {Object} 用户行为数据对象
 */
function createUserBehavior({
  behaviorId,
  type,
  action,
  sessionId,
  url,
  userAgent,
  timestamp,
  userId = '',
  pageLoadTime = 0,
  level = UserBehaviorLevel.MEDIUM,
  customData = {},
}) {
  return {
    behaviorId,
    type,
    action,
    userId,
    sessionId,
    url,
    userAgent,
    timestamp,
    pageLoadTime,
    level,
    customData,
  };
}

/**
 * 生成行为ID（简单的 base64 编码）
 * @param {string} type - 行为类型
 * @param {string} action - 行为动作
 * @returns {string} 生成的行为ID
 */
function generateBehaviorId(type, action) {
  const str = `${type}_${action}_${Date.now()}`;
  return btoa(str).substring(0, 16);
}

/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证行为类型是否有效
 * @param {string} type - 行为类型
 * @returns {boolean} 是否有效
 */
function isValidBehaviorType(type) {
  return UserBehaviorTypeValues.includes(type);
}

/**
 * 验证重要程度级别是否有效
 * @param {string} level - 重要程度级别
 * @returns {boolean} 是否有效
 */
function isValidBehaviorLevel(level) {
  return UserBehaviorLevelValues.includes(level);
}

// 导出（CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UserBehaviorType,
    UserBehaviorTypeValues,
    UserBehaviorLevel,
    UserBehaviorLevelValues,
    ApiResponseCode,
    DefaultConfig,
    createUserBehavior,
    generateBehaviorId,
    generateSessionId,
    isValidBehaviorType,
    isValidBehaviorLevel,
  };
}

// 导出（ES Module）
if (typeof exports !== 'undefined') {
  exports.UserBehaviorType = UserBehaviorType;
  exports.UserBehaviorTypeValues = UserBehaviorTypeValues;
  exports.UserBehaviorLevel = UserBehaviorLevel;
  exports.UserBehaviorLevelValues = UserBehaviorLevelValues;
  exports.ApiResponseCode = ApiResponseCode;
  exports.DefaultConfig = DefaultConfig;
  exports.createUserBehavior = createUserBehavior;
  exports.generateBehaviorId = generateBehaviorId;
  exports.generateSessionId = generateSessionId;
  exports.isValidBehaviorType = isValidBehaviorType;
  exports.isValidBehaviorLevel = isValidBehaviorLevel;
}
