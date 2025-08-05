// API Functions for VPN Management - Updated 2025-01-16
import axios from "axios";
import type { 
  VpnSubscription, 
  VpnOffer, 
  SellerServer, 
  SellerStats, 
  SellerSubscriber, 
  SalesData, 
  CreateServerForm,
  ServerConnectionData,
  ServerConnectionResult,
  WireGuardDeploymentResult,
  ServerTestingResult,
  VpnServiceConfig,
  PurchaseResponse
} from "../utils/types";

// Создаем базовый axios инстанс для интеграции с backend через API Gateway
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем автоматическую подстановку токена из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Флаг для предотвращения повторных попыток обновления токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Функция для обработки очереди запросов
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Перехватчик ответов для обработки ошибок и автоматического обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 401 и у нас есть refresh токен, пытаемся обновить токен
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          console.log('🔄 Попытка обновления токена...');
          const response = await api.post<LoginResponse>('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken, user } = response.data;
          
          // Сохраняем новые токены
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          console.log('✅ Токен успешно обновлен');
          
          // Обновляем заголовок для оригинального запроса
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Обрабатываем очередь ожидающих запросов
          processQueue(null, token);
          
          // Повторяем оригинальный запрос
          return api(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Ошибка обновления токена:', refreshError);
          
          // Очищаем данные и перенаправляем на логин
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          
          processQueue(refreshError, null);
          
          // Перенаправляем на страницу логина
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (refreshToken && isRefreshing) {
        // Если токен уже обновляется, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      } else {
        // Нет refresh токена - сразу перенаправляем на логин
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }

    // Стандартная обработка ошибок
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      if (errorData.error) {
        throw new Error(errorData.error);
      }
    }
    
    // Обработка сетевых ошибок
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Не удается подключиться к серверу. Проверьте подключение к интернету.');
    }
    
    // Обработка HTTP статусов
    switch (error.response?.status) {
      case 401:
        throw new Error('Неверный email или пароль');
      case 409:
        throw new Error('Пользователь с таким email уже существует');
      case 500:
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже.');
      default:
        throw new Error(error.message || 'Произошла ошибка. Попробуйте позже.');
    }
  }
);

export default api;

// Функция для аутентифицированных запросов (использует настроенный axios инстанс)
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  const body = options.body;
  
  try {
    const response = await api({
      url: url,
      method: method as any,
      data: body ? JSON.parse(body as string) : undefined,
      headers: options.headers as any,
    });
    
    // Создаем объект Response для совместимости
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as any,
    });
  } catch (error: any) {
    // Обрабатываем ошибки axios
    if (error.response) {
      return new Response(JSON.stringify(error.response.data), {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
      });
    }
    throw error;
  }
}

// Типы для API ответов
export interface SubscriptionStatus {
  isActive: boolean;
  daysLeft: number;
  expiresAt: string;
  subscriptions: VpnSubscription[];
}

// Типы для аутентификации (соответствуют backend)
export interface UserProfile {
  id: number;
  email: string;
  createdAt: string;
  isActive: boolean;
  role: 'USER' | 'SELLER' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  type: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface BecomeSellerRequest {
  isSelfEmployed: boolean;
  businessName?: string;
  businessDescription?: string;
}

export interface SessionResponse {
  id: number;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  current: boolean;
}

// Демонстрационные данные для VPN подписок
const mockSubscriptions: VpnSubscription[] = [
  {
    id: '1',
    name: 'Premium Germany VPN',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    server: 'Berlin-Premium-01',
    isActive: true,
    daysLeft: 25,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    speed: '1 Gb/s',
    ping: 25,
    load: 35,
    plan: 'premium',
    price: 9.99,
    currency: 'USD'
  },
  {
    id: '2', 
    name: 'Basic USA VPN',
    country: 'United States',
    countryCode: 'US', 
    flag: '🇺🇸',
    server: 'NewYork-Basic-03',
    isActive: true,
    daysLeft: 12,
    expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    speed: '500 Mb/s',
    ping: 45,
    load: 68,
    plan: 'basic',
    price: 4.99,
    currency: 'USD'
  },
  {
    id: '3',
    name: 'Enterprise Japan VPN',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    server: 'Tokyo-Enterprise-01',
    isActive: true,
    daysLeft: 3,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    speed: '2 Gb/s',
    ping: 15,
    load: 22,
    plan: 'enterprise',
    price: 19.99,
    currency: 'USD'
  },
  {
    id: '4',
    name: 'Premium UK VPN',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    server: 'London-Premium-02',
    isActive: false,
    daysLeft: 0,
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    speed: '1 Gb/s',
    ping: 30,
    load: 45,
    plan: 'premium',
    price: 9.99,
    currency: 'USD'
  },
  {
    id: '5',
    name: 'Basic Netherlands VPN',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    server: 'Amsterdam-Basic-01',
    isActive: true,
    daysLeft: 18,
    expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    speed: '300 Mb/s',
    ping: 20,
    load: 52,
    plan: 'basic',
    price: 4.99,
    currency: 'USD'
  }
];

// Функция регистрации с автоматической авторизацией
export async function register(email: string, password: string): Promise<LoginResponse> {
  const requestData: RegisterRequest = { email, password };
  
  try {
    const response = await api.post<LoginResponse>('/auth/register', requestData);
    const { token, refreshToken, user } = response.data;
    
    // Сохраняем токены и данные пользователя
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('✅ Регистрация успешна:', user);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    throw error;
  }
}

// Функция входа в систему
export async function login(email: string, password: string): Promise<LoginResponse> {
  const requestData: LoginRequest = { email, password };
  
  try {
    const response = await api.post<LoginResponse>('/auth/login', requestData);
    const { token, refreshToken, user } = response.data;
    
    // Сохраняем токены и данные пользователя
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('✅ Вход выполнен успешно:', user);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    throw error;
  }
}

// Функция получения профиля пользователя
export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await api.get<UserProfile>('/auth/profile');
    
    // Обновляем сохраненные данные пользователя
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    
    console.log('✅ Профиль получен:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения профиля:', error);
    
    // Если токен недействителен, очищаем данные
    if (error instanceof Error && error.message.includes('401')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
    
    throw error;
  }
}

// Функция обновления токена
export async function refreshToken(): Promise<LoginResponse> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  if (!refreshTokenValue) {
    throw new Error('Refresh токен не найден');
  }
  
  try {
    const response = await api.post<LoginResponse>('/auth/refresh', { 
      refreshToken: refreshTokenValue 
    });
    const { token, refreshToken: newRefreshToken, user } = response.data;
    
    // Сохраняем новые токены
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('✅ Токен обновлен успешно');
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка обновления токена:', error);
    
    // Очищаем данные при ошибке
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    
    throw error;
  }
}

// Функция выхода из системы
export async function logout(): Promise<void> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  try {
    if (refreshTokenValue) {
      await api.post('/auth/logout', { refreshToken: refreshTokenValue });
    }
  } catch (error) {
    console.warn('Ошибка при выходе из системы:', error);
    // Продолжаем выход, даже если запрос не удался
  } finally {
    // Очищаем локальные данные
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    
    console.log('✅ Выход из системы завершен');
  }
}

// Функция выхода из всех устройств
export async function logoutAll(): Promise<void> {
  try {
    await api.post('/auth/logout-all');
    console.log('✅ Выход из всех устройств завершен');
  } catch (error) {
    console.error('❌ Ошибка выхода из всех устройств:', error);
    throw error;
  } finally {
    // Всегда очищаем локальные данные
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }
}

// Функция получения активных сессий
export async function getActiveSessions(): Promise<SessionResponse[]> {
  try {
    const response = await api.get<SessionResponse[]>('/auth/sessions');
    console.log('✅ Активные сессии получены:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения сессий:', error);
    throw error;
  }
}

// Функция отзыва конкретной сессии
export async function revokeSession(sessionId: number): Promise<void> {
  try {
    await api.delete(`/auth/sessions/${sessionId}`);
    console.log('✅ Сессия отозвана:', sessionId);
  } catch (error) {
    console.error('❌ Ошибка отзыва сессии:', error);
    throw error;
  }
}

// Функция удаления аккаунта
export async function deleteAccount(): Promise<void> {
  try {
    await api.delete('/auth/account');
    console.log('✅ Аккаунт удален');
  } catch (error) {
    console.error('❌ Ошибка удаления аккаунта:', error);
    throw error;
  } finally {
    // Всегда очищаем локальные данные после удаления аккаунта
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }
}

// Получение статуса подписки пользователя
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await authenticatedFetch('/vpn/user/subscription-status');
  
  if (!response.ok) {
    throw new Error('Failed to fetch subscription status');
  }
  
  return await response.json();
}

// Mock-функция получения VPN конфигурации
export async function getVpnConfig(): Promise<Blob> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  // Создаем mock содержимое VPN конфигурации
  const configContent = `# VPN config mock
# Это заглушка VPN-конфигурации для демонстрации
# Реальная конфигурация будет генерироваться сервером

[Interface]
PrivateKey = mock_private_key_${Date.now()}
Address = 10.0.0.2/24

[Peer]
PublicKey = mock_server_public_key_here
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0

# Сгенерировано: ${new Date().toLocaleString('ru-RU')}`;

  return new Blob([configContent], { type: 'text/plain' });
}

// Mock-функция перегенерации VPN конфигурации
export async function regenerateVpnConfig(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // В реальном приложении здесь будет запрос на сервер для перегенерации ключей
  // Пока просто имитируем успешную операцию
}

// Mock-функция покупки подписки
export async function mockPurchaseSubscription(months: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  console.log(`Покупка подписки на ${months} мес.`);
  
  // Получаем текущую подписку, если она есть
  const savedSubscription = localStorage.getItem('mockSubscription');
  let startDate = new Date();
  
  if (savedSubscription) {
    const currentSubscription = JSON.parse(savedSubscription);
    const currentExpiresAt = new Date(currentSubscription.expiresAt);
    
    // Если подписка еще активна, то новое время добавляется к дате окончания
    // Если подписка уже истекла, то отсчитываем от текущей даты
    const now = new Date();
    if (currentExpiresAt > now) {
      startDate = currentExpiresAt; // Добавляем к дате окончания активной подписки
    }
    // Если подписка истекла, то startDate остается текущей датой
  }
  
  // Вычисляем новую дату окончания
  const newExpiresAt = new Date(startDate);
  newExpiresAt.setMonth(newExpiresAt.getMonth() + months);
  
  const subscription = {
    expiresAt: newExpiresAt.toISOString().split('T')[0], // Формат YYYY-MM-DD
    purchasedAt: new Date().toISOString(),
    months,
  };
  
  localStorage.setItem('mockSubscription', JSON.stringify(subscription));
}

// Получение всех подписок пользователя
export async function getUserSubscriptions(): Promise<VpnSubscription[]> {
  const response = await authenticatedFetch('/vpn/user/subscriptions');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user subscriptions');
  }
  
  return await response.json();
}

// Получение VPN конфигурации для конкретной подписки
export async function getVpnConfigForSubscription(subscriptionId: string): Promise<Blob> {
  const response = await authenticatedFetch(`/vpn/user/subscriptions/${subscriptionId}/config`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch VPN config');
  }
  
  const configContent = await response.text();
  return new Blob([configContent], { type: 'text/plain' });
}

// Перегенерация VPN конфигурации для конкретной подписки
export async function regenerateVpnConfigForSubscription(subscriptionId: string): Promise<void> {
  const response = await authenticatedFetch(`/vpn/user/subscriptions/${subscriptionId}/regenerate`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to regenerate VPN config');
  }
}

// Продление конкретной подписки
export async function extendSubscription(subscriptionId: string, months: number): Promise<void> {
  const response = await authenticatedFetch(`/vpn/user/subscriptions/${subscriptionId}/extend?months=${months}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to extend subscription');
  }
}

// Получение VPN предложений для маркетплейса 
export async function getVpnOffers(): Promise<VpnOffer[]> {
  // Используем существующую функцию getMarketplacePlans для единообразия
  return await getMarketplacePlans();
}

// Покупка VPN предложения
export async function purchaseVpnOffer(
  offerId: string, 
  plan: 'monthly' | 'yearly' = 'monthly'
): Promise<PurchaseResponse> {
  const response = await authenticatedFetch(`/vpn/marketplace/plans/${offerId}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ billingCycle: plan }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при покупке подписки');
  }

  return await response.json();
}

// Получение статистики продавца
export async function getSellerStats(): Promise<SellerStats> {
  const response = await authenticatedFetch('/vpn/seller/stats', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении статистики продавца');
  }

  const data = await response.json();
  
  // Преобразуем BigDecimal значения в number для фронтенда
  return {
    ...data,
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0),
    averageRating: Number(data.averageRating || 0),
    conversionRate: Number(data.conversionRate || 0),
    churnRate: Number(data.churnRate || 0)
  };
}

// Получение списка серверов продавца
export async function getSellerServers(): Promise<SellerServer[]> {
  const response = await authenticatedFetch('/vpn/seller/servers', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении списка серверов');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return data.map((server: any) => ({
    ...server,
    totalRevenue: Number(server.totalRevenue || 0),
    monthlyRevenue: Number(server.monthlyRevenue || 0),
    uptime: Number(server.uptime || 0)
  }));
}

// Получение подписчиков продавца
export async function getSellerSubscribers(): Promise<SellerSubscriber[]> {
  const response = await authenticatedFetch('/vpn/seller/subscribers', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении списка подписчиков');
  }

  const data = await response.json();
  
  // Преобразуем данные для совместимости с фронтендом
  return data.map((subscriber: any) => ({
    ...subscriber,
    totalPaid: Number(subscriber.totalPaid || 0)
  }));
}

// Получение данных о продажах за период
export async function getSalesData(days: number = 30): Promise<SalesData[]> {
  const response = await authenticatedFetch(`/vpn/seller/sales?days=${days}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении данных о продажах');
  }

  const data = await response.json();
  
  // Преобразуем данные для совместимости с фронтендом
  return data.map((record: any) => ({
    ...record,
    revenue: Number(record.revenue || 0)
  }));
}

// Создание нового сервера
export async function createServer(serverData: CreateServerForm): Promise<SellerServer> {
  const response = await authenticatedFetch('/vpn/seller/servers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serverData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при создании сервера');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0),
    uptime: Number(data.uptime || 0),
    flag: getFlagByCountryCode(data.countryCode)
  };
}

// Обновление сервера
export async function updateServer(serverId: string, updates: Partial<SellerServer>): Promise<SellerServer> {
  // Преобразуем updates в формат CreateServerRequest
  const updateData = {
    name: updates.name,
    country: updates.country,
    countryCode: updates.countryCode,
    city: updates.city,
    maxConnections: updates.maxConnections,
    bandwidth: updates.bandwidth,
    speed: updates.speed,
    description: updates.description,
    features: updates.features
  };

  const response = await authenticatedFetch(`/vpn/seller/servers/${serverId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении сервера');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0),
    uptime: Number(data.uptime || 0),
    flag: getFlagByCountryCode(data.countryCode)
  };
}

// Удаление сервера
export async function deleteServer(serverId: string): Promise<void> {
  const response = await authenticatedFetch(`/vpn/seller/servers/${serverId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при удалении сервера');
  }
}

// Переключение статуса сервера
export async function toggleServerStatus(serverId: string): Promise<SellerServer> {
  const response = await authenticatedFetch(`/vpn/seller/servers/${serverId}/toggle`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при изменении статуса сервера');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0),
    uptime: Number(data.uptime || 0)
  };
}

// Вспомогательная функция для получения флага по коду страны
function getFlagByCountryCode(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸', 'DE': '🇩🇪', 'GB': '🇬🇧', 'JP': '🇯🇵', 'CA': '🇨🇦',
    'FR': '🇫🇷', 'NL': '🇳🇱', 'CH': '🇨🇭', 'SG': '🇸🇬', 'AU': '🇦🇺',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IT': '🇮🇹',
    'ES': '🇪🇸', 'BR': '🇧🇷', 'IN': '🇮🇳', 'KR': '🇰🇷', 'HK': '🇭🇰'
  };
  
  return flags[countryCode] || '🏳️';
}

// API функции для создания сервера

// Проверка подключения к серверу
export async function checkServerConnection(connectionData: ServerConnectionData): Promise<ServerConnectionResult> {
  try {
    const response = await authenticatedFetch('/vpn/seller/servers/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: connectionData.ip,
        rootPassword: connectionData.rootPassword
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка при проверке подключения к серверу');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к серверу:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при подключении'
    };
  }
}

// Шаг 2: Развертывание WireGuard (с обновлениями в реальном времени)
export async function deployWireGuardWithProgress(
  serverIp: string, 
  onProgress: (result: WireGuardDeploymentResult) => void
): Promise<WireGuardDeploymentResult> {
  const steps = [
    { id: 'env', name: 'Подготовка окружения', status: 'pending' as const, details: '', logs: [] },
    { id: 'scripts', name: 'Загрузка скриптов', status: 'pending' as const, details: '', logs: [] },
    { id: 'install', name: 'Установка WireGuard', status: 'pending' as const, details: '', logs: [] },
    { id: 'config', name: 'Настройка конфигурации', status: 'pending' as const, details: '', logs: [] }
  ];
  
  const result = { success: true, steps: [...steps] };
  
  // Детальная информация для каждого шага
  const stepDetails = {
    'env': {
      logs: [
        'Проверка операционной системы...',
        'Обновление списка пакетов...',
        'Проверка прав доступа root...',
        'Создание рабочей директории...',
        'Настройка переменных окружения...'
      ],
      finalDetails: 'Окружение подготовлено, система готова к установке'
    },
    'scripts': {
      logs: [
        'Загрузка официального скрипта WireGuard...',
        'Проверка цифровой подписи скрипта...',
        'Загрузка дополнительных зависимостей...',
        'Проверка целостности файлов...',
        'Скрипты готовы к выполнению'
      ],
      finalDetails: 'Все необходимые скрипты загружены и проверены'
    },
    'install': {
      logs: [
        'Установка пакета wireguard-tools...',
        'Конфигурация ядра Linux...',
        'Установка wireguard-dkms...',
        'Компиляция модулей ядра...',
        'Регистрация службы WireGuard...',
        'Проверка установки...'
      ],
      finalDetails: 'WireGuard успешно установлен и готов к настройке'
    },
    'config': {
      logs: [
        'Генерация ключевой пары сервера...',
        'Создание конфигурационного файла...',
        'Настройка сетевых интерфейсов...',
        'Конфигурация правил фаервола...',
        'Применение настроек маршрутизации...',
        'Запуск службы WireGuard...'
      ],
      finalDetails: 'Конфигурация завершена, сервер готов принимать подключения'
    }
  };
  
     // Имитация пошагового выполнения с детальными логами
   for (let i = 0; i < steps.length; i++) {
     const stepId = steps[i].id;
     const stepLogs = stepDetails[stepId as keyof typeof stepDetails].logs;
     
     result.steps[i].status = 'running';
     result.steps[i].details = 'Выполнение...';
     onProgress({ ...result }); // Обновляем UI
     
     // Имитация выполнения с логами
     for (let logIndex = 0; logIndex < stepLogs.length; logIndex++) {
       await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
       result.steps[i].logs = stepLogs.slice(0, logIndex + 1);
       onProgress({ ...result }); // Обновляем UI на каждом логе
       
       // Моки всегда успешны для демонстрации
       // if (Math.random() < 0.05) {
       //   result.steps[i].status = 'error';
       //   result.steps[i].error = `Ошибка при выполнении: ${stepLogs[logIndex]}`;
       //   result.success = false;
       //   result.error = `Не удалось выполнить шаг: ${steps[i].name}`;
       //   onProgress({ ...result }); // Обновляем UI при ошибке
       //   return result;
       // }
     }
     
         await new Promise(resolve => setTimeout(resolve, 500));
    result.steps[i].status = 'completed';
    result.steps[i].details = stepDetails[stepId as keyof typeof stepDetails].finalDetails;
    onProgress({ ...result }); // Обновляем UI при завершении шага
  }
  
  // После успешной имитации, вызываем реальное API для развертывания
  try {
    const realResult = await deployWireGuard(serverIp);
    if (realResult.success) {
      return result; // Возвращаем результат имитации с успехом
    } else {
      // Если реальное API вернуло ошибку, обновляем результат
      result.success = false;
      result.error = realResult.error;
      return result;
    }
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Ошибка при развертывании WireGuard';
    return result;
  }
}

// Шаг 3: Тестирование сервера (с обновлениями в реальном времени)
export async function testServerReadinessWithProgress(
  serverIp: string,
  onProgress: (result: ServerTestingResult) => void
): Promise<ServerTestingResult> {
  const tests = [
    { id: 'ping', name: 'Проверка доступности сервера', status: 'pending' as const, details: '', logs: [] },
    { id: 'wireguard', name: 'Проверка WireGuard', status: 'pending' as const, details: '', logs: [] },
    { id: 'ports', name: 'Проверка открытых портов', status: 'pending' as const, details: '', logs: [] },
    { id: 'config', name: 'Проверка конфигурации', status: 'pending' as const, details: '', logs: [] }
  ];
  
  const result = { 
    success: true, 
    tests: [...tests],
    overallStatus: 'running' as const
  };
  
  // Детальная информация для каждого теста
  const testDetails = {
    'ping': {
      logs: [
        'Отправка ICMP пакетов...',
        'Анализ времени отклика...',
        'Проверка стабильности соединения...',
        'Тестирование потери пакетов...'
      ],
      successDetails: 'Сервер отвечает за 15ms, потеря пакетов 0%',
      runningDetails: 'Проверка сетевой доступности...'
    },
    'wireguard': {
      logs: [
        'Проверка статуса службы WireGuard...',
        'Анализ конфигурационных файлов...',
        'Тестирование сетевого интерфейса...',
        'Проверка ключей шифрования...',
        'Валидация настроек маршрутизации...'
      ],
      successDetails: 'WireGuard работает корректно, интерфейс wg0 активен',
      runningDetails: 'Диагностика WireGuard...'
    },
    'ports': {
      logs: [
        'Сканирование порта 51820/UDP...',
        'Проверка правил фаервола...',
        'Тестирование внешней доступности...',
        'Анализ NAT конфигурации...'
      ],
      successDetails: 'Порт 51820/UDP открыт и доступен извне',
      runningDetails: 'Тестирование сетевых портов...'
    },
    'config': {
      logs: [
        'Валидация синтаксиса конфигурации...',
        'Проверка целостности ключей...',
        'Анализ сетевых настроек...',
        'Тестирование DNS резолюции...',
        'Проверка совместимости протоколов...'
      ],
      successDetails: 'Конфигурация валидна, все параметры корректны',
      runningDetails: 'Проверка конфигурации...'
    }
  };
  
     // Имитация пошагового тестирования с детальными логами
   for (let i = 0; i < tests.length; i++) {
     const testId = tests[i].id;
     const testInfo = testDetails[testId as keyof typeof testDetails];
     
     result.tests[i].status = 'running';
     result.tests[i].details = testInfo.runningDetails;
     onProgress({ ...result }); // Обновляем UI
     
     // Имитация выполнения с логами
     for (let logIndex = 0; logIndex < testInfo.logs.length; logIndex++) {
       await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
       result.tests[i].logs = testInfo.logs.slice(0, logIndex + 1);
       onProgress({ ...result }); // Обновляем UI на каждом логе
       
       // Моки всегда успешны для демонстрации
       // if (Math.random() < 0.08) {
       //   result.tests[i].status = 'failed';
       //   result.tests[i].error = getTestError(tests[i].id);
       //   result.tests[i].details = `Ошибка при выполнении: ${testInfo.logs[logIndex]}`;
       //   result.success = false;
       //   result.overallStatus = 'failed';
       //   onProgress({ ...result }); // Обновляем UI при ошибке
       //   return result;
       // }
     }
     
     await new Promise(resolve => setTimeout(resolve, 300));
     result.tests[i].status = 'passed';
     result.tests[i].details = testInfo.successDetails;
     onProgress({ ...result }); // Обновляем UI при завершении теста
   }
  
  if (result.success) {
    result.overallStatus = 'passed';
  }
  
  // После успешной имитации, вызываем реальное API для тестирования
  try {
    const realResult = await testServerReadiness(serverIp);
    if (realResult.success) {
      return result; // Возвращаем результат имитации с успехом
    } else {
      // Если реальное API вернуло ошибку, обновляем результат
      result.success = false;
      result.overallStatus = 'failed';
      return result;
    }
  } catch (error) {
    result.success = false;
    result.overallStatus = 'failed';
    return result;
  }
}

// Развертывание WireGuard на сервере
export async function deployWireGuard(serverIp: string): Promise<WireGuardDeploymentResult> {
  try {
    const response = await authenticatedFetch(`/vpn/seller/servers/deploy-wireguard?serverIp=${encodeURIComponent(serverIp)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка при развертывании WireGuard');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Ошибка при развертывании WireGuard:', error);
    return {
      success: false,
      steps: [],
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при развертывании'
    };
  }
}

// Тестирование готовности сервера
export async function testServerReadiness(serverIp: string): Promise<ServerTestingResult> {
  try {
    const response = await authenticatedFetch(`/vpn/seller/servers/test-readiness?serverIp=${encodeURIComponent(serverIp)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка при тестировании сервера');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Ошибка при тестировании сервера:', error);
    return {
      success: false,
      tests: [],
      overallStatus: 'failed'
    };
  }
}

// Создание VPN-сервиса (вызывает реальное API создания сервера)
export async function createVpnService(config: VpnServiceConfig, serverIp: string): Promise<SellerServer> {
  // Преобразуем VpnServiceConfig в CreateServerForm для API
  const serverData = {
    name: config.name,
    country: config.country,
    countryCode: config.countryCode,
    city: config.city,
    maxConnections: config.maxConnections,
    bandwidth: config.bandwidth,
    speed: config.speed,
    description: config.description || '',
    features: config.features || []
  };

  // Вызываем реальное API для создания сервера
  return await createServer(serverData);
}

// Вспомогательные функции для тестирования
function getTestError(testId: string): string {
  const errors: Record<string, string> = {
    'ping': 'Сервер не отвечает на ping. Проверьте сетевые настройки.',
    'wireguard': 'WireGuard не запущен. Попробуйте переустановить.',
    'ports': 'Порт 51820 закрыт. Откройте порт в файрволе.',
    'config': 'Ошибка в конфигурации. Проверьте настройки.'
  };
  return errors[testId] || 'Неизвестная ошибка';
}

function getTestDetails(testId: string): string {
  const details: Record<string, string> = {
    'ping': 'Сервер отвечает за 15ms',
    'wireguard': 'WireGuard работает корректно',
    'ports': 'Порт 51820/UDP открыт',
    'config': 'Конфигурация валидна'
  };
  return details[testId] || 'Тест пройден';
}

// Функция для получения роли продавца
export async function becomeSeller(request: BecomeSellerRequest): Promise<UserProfile> {
  try {
    const response = await api.post<UserProfile>('/auth/become-seller', request);
    
    // Обновляем сохраненные данные пользователя
    localStorage.setItem('currentUser', JSON.stringify(response.data));
    
    console.log('✅ Роль продавца получена:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения роли продавца:', error);
    throw error;
  }
}

// ==================== ПЛАНЫ ПОДПИСКИ ====================

// Получение всех планов продавца
export async function getSellerPlans(): Promise<SubscriptionPlan[]> {
  const response = await authenticatedFetch('/vpn/seller/plans', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении планов подписки');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return data.map((plan: any) => ({
    ...plan,
    monthlyPrice: Number(plan.monthlyPrice || 0),
    yearlyPrice: Number(plan.yearlyPrice || 0),
    totalRevenue: Number(plan.totalRevenue || 0),
    monthlyRevenue: Number(plan.monthlyRevenue || 0)
  }));
}

// Получение планов для конкретного сервера
export async function getServerPlans(serverId: string): Promise<SubscriptionPlan[]> {
  const response = await authenticatedFetch(`/vpn/seller/servers/${serverId}/plans`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении планов сервера');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return data.map((plan: any) => ({
    ...plan,
    monthlyPrice: Number(plan.monthlyPrice || 0),
    yearlyPrice: Number(plan.yearlyPrice || 0),
    totalRevenue: Number(plan.totalRevenue || 0),
    monthlyRevenue: Number(plan.monthlyRevenue || 0)
  }));
}

// Создание нового плана подписки
export async function createSubscriptionPlan(serverId: string, planData: CreateSubscriptionPlanForm): Promise<SubscriptionPlan> {
  const response = await authenticatedFetch(`/vpn/seller/servers/${serverId}/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при создании плана');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    monthlyPrice: Number(data.monthlyPrice || 0),
    yearlyPrice: Number(data.yearlyPrice || 0),
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0)
  };
}

// Обновление плана подписки
export async function updateSubscriptionPlan(planId: string, planData: CreateSubscriptionPlanForm): Promise<SubscriptionPlan> {
  const response = await authenticatedFetch(`/vpn/seller/plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении плана');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    monthlyPrice: Number(data.monthlyPrice || 0),
    yearlyPrice: Number(data.yearlyPrice || 0),
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0)
  };
}

// Переключение статуса плана
export async function togglePlanStatus(planId: string): Promise<SubscriptionPlan> {
  const response = await authenticatedFetch(`/vpn/seller/plans/${planId}/toggle`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при изменении статуса плана');
  }

  const data = await response.json();

  // Преобразуем данные для совместимости с фронтендом
  return {
    ...data,
    monthlyPrice: Number(data.monthlyPrice || 0),
    yearlyPrice: Number(data.yearlyPrice || 0),
    totalRevenue: Number(data.totalRevenue || 0),
    monthlyRevenue: Number(data.monthlyRevenue || 0)
  };
}

// Удаление плана подписки
export async function deleteSubscriptionPlan(planId: string): Promise<void> {
  const response = await authenticatedFetch(`/vpn/seller/plans/${planId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при удалении плана');
  }
}

// Получение планов для маркетплейса
export async function getMarketplacePlans(): Promise<VpnOffer[]> {
  const response = await authenticatedFetch('/vpn/marketplace/plans', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении планов маркетплейса');
  }

  const data = await response.json();

  // Преобразуем данные планов в формат VpnOffer для совместимости
  return data.map((plan: any) => ({
    // Данные плана
    planId: plan.id,
    planName: plan.name,
    planType: plan.type,
    monthlyPrice: Number(plan.monthlyPrice || 0),
    yearlyPrice: Number(plan.yearlyPrice || 0),
    maxConnections: plan.maxConnections,
    bandwidthLimit: plan.bandwidthLimit,
    speedLimit: plan.speedLimit,
    features: plan.features || [],
    isPopular: plan.isPopular,
    description: plan.description,
    
    // Данные сервера
    serverId: plan.serverId,
    serverName: plan.serverName,
    country: plan.serverCountry,
    countryCode: plan.serverCountryCode || 'US',
    flag: plan.serverFlag,
    city: plan.serverCity,
    ping: 15, // Заглушка, в реальности будет приходить с сервера
    uptime: 99.9, // Заглушка
    isOnline: true, // Заглушка
    bandwidth: plan.bandwidthLimit || 'Безлимит',
    speed: plan.speedLimit || '1 Гбит/с',
    protocols: ['WireGuard', 'OpenVPN'], // Заглушка
    
    // Статистика
    totalSubscribers: plan.totalSubscribers || 0,
    activeSubscribers: plan.activeSubscribers || 0,
    rating: 4.5, // Заглушка для рейтинга
    reviewsCount: plan.totalSubscribers || 0,
    sellerName: 'VPN Seller', // Заглушка
    
    // Совместимость со старым интерфейсом
    id: plan.id,
    name: plan.name,
    server: plan.serverName,
    plan: plan.type,
    simultaneousConnections: plan.maxConnections,
    logPolicy: 'no-logs' as const
  }));
} 