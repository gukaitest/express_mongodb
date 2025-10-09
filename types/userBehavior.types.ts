/**
 * 用户行为监控 TypeScript 类型定义
 */

// 用户行为类型枚举
export enum UserBehaviorType {
  CLICK = 'click',
  SCROLL = 'scroll',
  INPUT = 'input',
  FOCUS = 'focus',
  BLUR = 'blur',
  RESIZE = 'resize',
  NAVIGATION = 'navigation',
  PAGE_VIEW = 'page_view',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  CUSTOM = 'custom',
}

// 重要程度级别枚举
export enum UserBehaviorLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 用户行为数据接口
export interface UserBehaviorData {
  /** 行为唯一标识符 */
  behaviorId: string;
  /** 行为类型 */
  type: UserBehaviorType | string;
  /** 具体行为动作 */
  action: string;
  /** 用户ID（可选） */
  userId?: string;
  /** 会话ID */
  sessionId: string;
  /** 页面URL */
  url: string;
  /** 用户代理字符串 */
  userAgent: string;
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 页面加载时间（毫秒，可选） */
  pageLoadTime?: number;
  /** 重要程度级别（可选） */
  level?: UserBehaviorLevel | string;
  /** 自定义数据（可选） */
  customData?: Record<string, any>;
}

// API 响应接口
export interface ApiResponse<T = any> {
  code: string;
  msg: string;
  data?: T;
}

// 用户行为列表响应数据
export interface UserBehaviorListData {
  list: UserBehaviorData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户行为统计数据
export interface UserBehaviorStatsData {
  totalEvents: number;
  uniqueUserCount: number;
  uniqueSessionCount: number;
  avgPageLoadTime: number;
  maxPageLoadTime: number;
  minPageLoadTime: number;
  typeStats: Record<string, number>;
  actionStats: Record<string, number>;
  levelStats: Record<string, number>;
}

// 热门用户行为数据
export interface TopUserBehaviorData {
  _id: string;
  type: string;
  action: string;
  url: string;
  count: number;
  uniqueUserCount: number;
  uniqueSessionCount: number;
  lastOccurred: number;
  firstOccurred: number;
  avgPageLoadTime: number;
  frequency: number;
}

// 用户行为路径数据
export interface UserBehaviorPathData {
  _id: string;
  sessionId: string;
  userId: string;
  events: Array<{
    type: string;
    action: string;
    url: string;
    timestamp: number;
    pageLoadTime: number;
    level: string;
  }>;
  startTime: number;
  endTime: number;
  totalEvents: number;
  totalPageLoadTime: number;
  avgPageLoadTime: number;
  duration: number;
}

// 漏斗分析步骤数据
export interface FunnelStepData {
  step: number;
  url: string;
  count: number;
  uniqueUserCount: number;
  uniqueSessionCount: number;
  conversionRate: string;
  dropOffRate: string;
  dropOffCount: number;
}

// 漏斗分析响应数据
export interface FunnelAnalysisData {
  steps: FunnelStepData[];
  totalSteps: number;
  overallConversionRate: string;
}

// 热力图数据
export interface HeatmapData {
  _id: string;
  url: string;
  type: string;
  action: string;
  count: number;
  uniqueUserCount: number;
  uniqueSessionCount: number;
  avgPageLoadTime: number;
  intensity: 'low' | 'medium' | 'high';
}

// 批量创建用户行为请求数据
export interface BatchUserBehaviorRequest {
  behaviors: UserBehaviorData[];
}

// 查询参数接口
export interface UserBehaviorQueryParams {
  type?: UserBehaviorType | string;
  userId?: string;
  sessionId?: string;
  url?: string;
  action?: string;
  level?: UserBehaviorLevel | string;
  startTime?: number;
  endTime?: number;
  pageNo?: number;
  pageSize?: number;
  limit?: number;
  urls?: string;
}
