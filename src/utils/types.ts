// Базовые типы для VPN приложения

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  premium: boolean;
}

// Интерфейс для VPN подписки
export interface VpnSubscription {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  server: string;
  isActive: boolean;
  daysLeft: number;
  expiresAt: string;
  speed: string;
  ping: number;
  load: number;
  plan: 'basic' | 'premium' | 'enterprise';
  price: number;
  currency: string;
}

export interface VpnConnection {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  server?: VpnServer;
  connectedAt?: Date;
  bytesReceived: number;
  bytesSent: number;
  ip?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium' | 'enterprise';
  subscriptionEndDate?: Date;
  avatar?: string;
  role?: UserRole;
}

export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export interface Settings {
  autoConnect: boolean;
  selectedProtocol: 'openvpn' | 'wireguard' | 'ikev2';
  killSwitch: boolean;
  dnsLeakProtection: boolean;
  startOnBoot: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
}

// Общие типы для API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Типы для форм
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface BecomeSellerForm {
  isSelfEmployed: boolean;
  businessName?: string;
  businessDescription?: string;
}

// Состояния загрузки
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

// Типы для маркетплейса VPN - обновлены для работы с планами
export interface VpnOffer {
  // Данные плана
  planId: string;
  planName: string;
  planType: 'basic' | 'premium' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  maxConnections: number;
  bandwidthLimit?: string;
  speedLimit?: string;
  features: string[];
  isPopular: boolean;
  description: string;
  
  // Данные сервера
  serverId: string;
  serverName: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  ping: number;
  uptime: number;
  isOnline: boolean;
  bandwidth: string;
  speed: string;
  protocols: string[];
  
  // Статистика
  totalSubscribers: number;
  activeSubscribers: number;
  rating: number;
  reviewsCount: number;
  sellerName: string;
  
  // Совместимость
  id: string;
  name: string;
  server: string;
  plan: 'basic' | 'premium' | 'enterprise';
  simultaneousConnections: number;
  logPolicy: 'no-logs' | 'minimal-logs';
}

// Типы для продавца VPN
export interface SellerServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  ip?: string;
  port?: number;
  plan?: 'basic' | 'premium' | 'enterprise';
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxConnections: number;
  currentConnections?: number;
  bandwidth: string;
  speed: string;
  ping?: number;
  uptime: number;
  isOnline?: boolean;
  isActive: boolean;
  createdAt: string;
  totalSubscribers?: number;
  activeSubscribers?: number;
  totalRevenue: number;
  monthlyRevenue: number;
  status?: string;
  features?: string[];
  protocols?: string[];
  description?: string;
}

export interface SellerStats {
  totalServers: number;
  activeServers: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  churnRate: number;
}

export interface SellerSubscriber {
  id: string;
  email: string;
  planId: string;
  planName: string;
  serverId: string;
  serverName: string;
  billingCycle: string; // 'monthly' | 'yearly' but can be flexible
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalPaid: number;
  lastLogin?: string;
  country?: string;
  flag?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  subscribers: number;
  refunds: number;
}

export interface ServerMetrics {
  serverId: string;
  date: string;
  activeConnections: number;
  bandwidth: number;
  uptime: number;
  revenue: number;
}

export interface CreateServerForm {
  name: string;
  country: string;
  countryCode: string;
  city: string;
  maxConnections: number;
  bandwidth: string;
  speed: string;
  description: string;
  features: string[];
}

export interface CreateSubscriptionPlanForm {
  name: string;
  type: 'basic' | 'premium' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  maxConnections: number;
  bandwidthLimit: string;
  speedLimit: string;
  isPopular: boolean;
  sortOrder: number;
  features: string[];
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  serverCountry: string;
  serverCity: string;
  serverFlag: string;
  type: 'basic' | 'premium' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  maxConnections: number;
  bandwidthLimit?: string;
  speedLimit?: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  features: string[];
  description: string;
  totalSubscribers: number;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  createdAt: string;
}

// Типы для процесса создания сервера
export interface ServerConnectionData {
  ip: string;
  rootPassword: string;
}

export interface ServerConnectionResult {
  success: boolean;
  error?: string;
  serverInfo?: {
    ip: string;
    os: string;
    region: string;
    provider: string;
  };
}

export interface WireGuardDeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  logs?: string[];
  error?: string;
}

export interface WireGuardDeploymentResult {
  success: boolean;
  steps: WireGuardDeploymentStep[];
  error?: string;
}

export interface ServerTestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  logs?: string[];
  error?: string;
}

export interface ServerTestingResult {
  success: boolean;
  tests: ServerTestResult[];
  overallStatus: 'running' | 'passed' | 'failed';
}

export interface VpnServiceConfig {
  name: string;
  country: string;
  countryCode: string;
  city: string;
  maxConnections: number;
  bandwidth: string;
  speed: string;
  description: string;
  features: string[];
  protocols: string[];
}

export interface CreateServerState {
  currentStep: 1 | 2 | 3 | 4;
  connectionData: ServerConnectionData | null;
  connectionResult: ServerConnectionResult | null;
  deploymentResult: WireGuardDeploymentResult | null;
  testingResult: ServerTestingResult | null;
  serviceConfig: VpnServiceConfig | null;
  isProcessing: boolean;
} 