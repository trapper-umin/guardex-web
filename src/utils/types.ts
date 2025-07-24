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
}

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

// Типы для маркетплейса VPN
export interface VpnOffer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  server: string;
  plan: 'basic' | 'premium' | 'enterprise';
  speed: string;
  ping: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  rating: number;
  reviewsCount: number;
  sellerName: string;
  uptime: number;
  isOnline: boolean;
  bandwidth: string;
  protocols: string[];
  logPolicy: 'no-logs' | 'minimal-logs';
  simultaneousConnections: number;
} 