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
  VpnServiceConfig
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

// Mock-функция получения статуса подписки
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Проверяем есть ли сохраненная подписка
  const savedSubscription = localStorage.getItem('mockSubscription');
  if (savedSubscription) {
    const subscription = JSON.parse(savedSubscription);
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      isActive: daysLeft > 0,
      daysLeft,
      expiresAt: subscription.expiresAt,
      subscriptions: mockSubscriptions, // Возвращаем демонстрационные данные
    };
  }
  
  // Возвращаем дефолтные данные
  return {
    isActive: true,
    daysLeft: 27,
    expiresAt: "2025-07-01",
    subscriptions: mockSubscriptions, // Возвращаем демонстрационные данные
  };
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

// Mock-функция получения всех подписок пользователя
export async function getUserSubscriptions(): Promise<VpnSubscription[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSubscriptions;
}

// Mock-функция получения VPN конфигурации для конкретной подписки
export async function getVpnConfigForSubscription(subscriptionId: string): Promise<Blob> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  const subscription = mockSubscriptions.find(sub => sub.id === subscriptionId);
  if (!subscription) {
    throw new Error('Подписка не найдена');
  }
  
  if (!subscription.isActive) {
    throw new Error('Подписка неактивна');
  }
  
  // Создаем mock содержимое VPN конфигурации для конкретной подписки
  const configContent = `# VPN config for ${subscription.name}
# Server: ${subscription.server}
# Country: ${subscription.country}
# Speed: ${subscription.speed}

[Interface]
PrivateKey = mock_private_key_${subscriptionId}_${Date.now()}
Address = 10.0.0.2/24

[Peer]
PublicKey = mock_server_public_key_${subscriptionId}
Endpoint = ${subscription.server.toLowerCase().replace(/[^a-z0-9]/g, '-')}.vpn.example.com:51820
AllowedIPs = 0.0.0.0/0

# Сгенерировано: ${new Date().toLocaleString('ru-RU')}
# Подписка: ${subscription.name}`;

  return new Blob([configContent], { type: 'text/plain' });
}

// Mock-функция перегенерации VPN конфигурации для конкретной подписки
export async function regenerateVpnConfigForSubscription(subscriptionId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  const subscription = mockSubscriptions.find(sub => sub.id === subscriptionId);
  if (!subscription) {
    throw new Error('Подписка не найдена');
  }
  
  if (!subscription.isActive) {
    throw new Error('Подписка неактивна');
  }
  
  // В реальном приложении здесь будет запрос на сервер для перегенерации ключей
  console.log(`Перегенерация ключа для подписки: ${subscription.name}`);
}

// Mock-функция продления конкретной подписки
export async function extendSubscription(subscriptionId: string, months: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const subscription = mockSubscriptions.find(sub => sub.id === subscriptionId);
  if (!subscription) {
    throw new Error('Подписка не найдена');
  }
  
  // В реальном приложении здесь был бы запрос к API
  // Пока просто обновляем локальные данные
  const currentDate = subscription.isActive ? new Date(subscription.expiresAt) : new Date();
  currentDate.setMonth(currentDate.getMonth() + months);
  
  subscription.expiresAt = currentDate.toISOString();
  subscription.daysLeft = Math.ceil((currentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  subscription.isActive = true;
  
  console.log(`Продление подписки ${subscription.name} на ${months} мес.`);
}

// Тестовые данные VPN предложений для маркетплейса
const mockVpnOffers: VpnOffer[] = [
  {
    id: '1',
    name: 'SuperSpeed USA',
    country: 'Соединённые Штаты',
    countryCode: 'US',
    flag: '🇺🇸',
    server: 'New York, NY',
    plan: 'premium',
    speed: '1 Гбит/с',
    ping: 15,
    monthlyPrice: 12,
    yearlyPrice: 120,
    features: ['Netflix поддержка', 'Торрент разрешён', 'P2P оптимизация'],
    rating: 4.8,
    reviewsCount: 342,
    sellerName: 'TechVPN Solutions',
    uptime: 99.9,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 5
  },
  {
    id: '2',
    name: 'Euro Fast VPN',
    country: 'Германия',
    countryCode: 'DE',
    flag: '🇩🇪',
    server: 'Frankfurt, DE',
    plan: 'premium',
    speed: '800 Мбит/с',
    ping: 8,
    monthlyPrice: 10,
    yearlyPrice: 100,
    features: ['GDPR совместимость', 'Высокая приватность', 'Быстрое подключение'],
    rating: 4.9,
    reviewsCount: 128,
    sellerName: 'EuroNet Services',
    uptime: 99.8,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
    logPolicy: 'no-logs',
    simultaneousConnections: 10
  },
  {
    id: '3',
    name: 'AsiaSpeed Pro',
    country: 'Япония',
    countryCode: 'JP',
    flag: '🇯🇵',
    server: 'Tokyo, JP',
    plan: 'enterprise',
    speed: '2 Гбит/с',
    ping: 5,
    monthlyPrice: 18,
    yearlyPrice: 180,
    features: ['Выделенный IP', 'DDoS защита', '24/7 поддержка'],
    rating: 4.7,
    reviewsCount: 89,
    sellerName: 'AsiaVPN Corp',
    uptime: 99.9,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 15
  },
  {
    id: '4',
    name: 'UK Privacy Shield',
    country: 'Великобритания',
    countryCode: 'GB',
    flag: '🇬🇧',
    server: 'London, UK',
    plan: 'basic',
    speed: '500 Мбит/с',
    ping: 12,
    monthlyPrice: 8,
    yearlyPrice: 80,
    features: ['BBC iPlayer', 'Хорошая скорость', 'Стабильное соединение'],
    rating: 4.5,
    reviewsCount: 203,
    sellerName: 'BritVPN Ltd',
    uptime: 99.5,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 3
  },
  {
    id: '5',
    name: 'Canada Secure',
    country: 'Канада',
    countryCode: 'CA',
    flag: '🇨🇦',
    server: 'Toronto, CA',
    plan: 'premium',
    speed: '750 Мбит/с',
    ping: 18,
    monthlyPrice: 11,
    yearlyPrice: 110,
    features: ['Строгие законы о конфиденциальности', 'Без цензуры', 'Стабильность'],
    rating: 4.6,
    reviewsCount: 156,
    sellerName: 'CanadaVPN Inc',
    uptime: 99.7,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 8
  },
  {
    id: '6',
    name: 'Singapore Lightning',
    country: 'Сингапур',
    countryCode: 'SG',
    flag: '🇸🇬',
    server: 'Singapore, SG',
    plan: 'enterprise',
    speed: '1.5 Гбит/с',
    ping: 3,
    monthlyPrice: 15,
    yearlyPrice: 150,
    features: ['Минимальная задержка', 'Игровая оптимизация', 'Premium поддержка'],
    rating: 4.9,
    reviewsCount: 74,
    sellerName: 'SingVPN Solutions',
    uptime: 99.9,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
    logPolicy: 'no-logs',
    simultaneousConnections: 12
  },
  {
    id: '7',
    name: 'Swiss Privacy Pro',
    country: 'Швейцария',
    countryCode: 'CH',
    flag: '🇨🇭',
    server: 'Zurich, CH',
    plan: 'premium',
    speed: '600 Мбит/с',
    ping: 10,
    monthlyPrice: 14,
    yearlyPrice: 140,
    features: ['Швейцарская конфиденциальность', 'Банковская безопасность', 'Zero logs'],
    rating: 4.8,
    reviewsCount: 95,
    sellerName: 'SwissVPN AG',
    uptime: 99.8,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 6
  },
  {
    id: '8',
    name: 'Netherlands Speed',
    country: 'Нидерланды',
    countryCode: 'NL',
    flag: '🇳🇱',
    server: 'Amsterdam, NL',
    plan: 'basic',
    speed: '400 Мбит/с',
    ping: 14,
    monthlyPrice: 7,
    yearlyPrice: 70,
    features: ['Торрент-френдли', 'Хорошее соотношение цена/качество', 'Стабильность'],
    rating: 4.4,
    reviewsCount: 167,
    sellerName: 'DutchVPN BV',
    uptime: 99.4,
    isOnline: true,
    bandwidth: 'Безлимитно',
    protocols: ['WireGuard', 'OpenVPN'],
    logPolicy: 'no-logs',
    simultaneousConnections: 3
  }
];

// Mock-функция получения VPN предложений для маркетплейса
export async function getVpnOffers(): Promise<VpnOffer[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockVpnOffers];
}

// Mock-функция покупки VPN предложения
export async function purchaseVpnOffer(
  offerId: string, 
  plan: 'monthly' | 'yearly' = 'monthly'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const offer = mockVpnOffers.find(o => o.id === offerId);
  if (!offer) {
    throw new Error('VPN предложение не найдено');
  }
  
  if (!offer.isOnline) {
    throw new Error('VPN сервер недоступен');
  }
  
  const price = plan === 'yearly' ? offer.yearlyPrice : offer.monthlyPrice;
  console.log(`Покупка VPN "${offer.name}" (${plan}) за $${price}`);
  
  // В реальном приложении здесь был бы вызов API платежной системы
  // и создание подписки в системе
}

// Мок-данные для продавца VPN
const mockSellerServers: SellerServer[] = [
  {
    id: '1',
    name: 'Premium Germany Server',
    country: 'Германия',
    countryCode: 'DE',
    flag: '🇩🇪',
    city: 'Berlin',
    ip: '185.230.127.45',
    port: 51820,
    plan: 'premium',
    monthlyPrice: 12,
    yearlyPrice: 120,
    maxConnections: 100,
    currentConnections: 67,
    bandwidth: '1 ТБ',
    speed: '1 Гбит/с',
    ping: 8,
    uptime: 99.8,
    isOnline: true,
    isActive: true,
    createdAt: '2024-01-15',
    totalSubscribers: 89,
    activeSubscribers: 67,
    totalRevenue: 4580,
    monthlyRevenue: 804,
    status: 'active',
    features: ['Netflix поддержка', 'Торрент разрешён', 'P2P оптимизация', 'DDoS защита'],
    protocols: ['WireGuard', 'OpenVPN'],
    description: 'Высокопроизводительный сервер в Берлине с премиум характеристиками'
  },
  {
    id: '2',
    name: 'Enterprise USA East',
    country: 'США',
    countryCode: 'US',
    flag: '🇺🇸',
    city: 'New York',
    ip: '104.238.167.23',
    port: 51820,
    plan: 'enterprise',
    monthlyPrice: 25,
    yearlyPrice: 240,
    maxConnections: 200,
    currentConnections: 134,
    bandwidth: '5 ТБ',
    speed: '2 Гбит/с',
    ping: 15,
    uptime: 99.9,
    isOnline: true,
    isActive: true,
    createdAt: '2023-11-20',
    totalSubscribers: 156,
    activeSubscribers: 134,
    totalRevenue: 12400,
    monthlyRevenue: 3350,
    status: 'active',
    features: ['Выделенный IP', 'DDoS защита', '24/7 поддержка', 'Premium скорость'],
    protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
    description: 'Корпоративный сервер в Нью-Йорке с максимальной производительностью'
  },
  {
    id: '3',
    name: 'Basic UK London',
    country: 'Великобритания',
    countryCode: 'GB',
    flag: '🇬🇧',
    city: 'London',
    ip: '217.160.45.178',
    port: 51820,
    plan: 'basic',
    monthlyPrice: 8,
    yearlyPrice: 80,
    maxConnections: 50,
    currentConnections: 23,
    bandwidth: '500 ГБ',
    speed: '500 Мбит/с',
    ping: 12,
    uptime: 99.5,
    isOnline: true,
    isActive: true,
    createdAt: '2024-02-10',
    totalSubscribers: 34,
    activeSubscribers: 23,
    totalRevenue: 1120,
    monthlyRevenue: 184,
    status: 'active',
    features: ['BBC iPlayer', 'Хорошая скорость', 'Стабильное соединение'],
    protocols: ['WireGuard', 'OpenVPN'],
    description: 'Базовый сервер в Лондоне для повседневного использования'
  },
  {
    id: '4',
    name: 'Japan Gaming Server',
    country: 'Япония',
    countryCode: 'JP',
    flag: '🇯🇵',
    city: 'Tokyo',
    ip: '139.162.78.149',
    port: 51820,
    plan: 'premium',
    monthlyPrice: 18,
    yearlyPrice: 180,
    maxConnections: 80,
    currentConnections: 45,
    bandwidth: '2 ТБ',
    speed: '1.5 Гбит/с',
    ping: 5,
    uptime: 99.7,
    isOnline: false,
    isActive: false,
    createdAt: '2024-03-05',
    totalSubscribers: 52,
    activeSubscribers: 0,
    totalRevenue: 2340,
    monthlyRevenue: 0,
    status: 'maintenance',
    features: ['Игровая оптимизация', 'Минимальная задержка', 'Premium поддержка'],
    protocols: ['WireGuard', 'OpenVPN'],
    description: 'Игровой сервер в Токио с минимальной задержкой (на техобслуживании)'
  }
];

const mockSellerSubscribers: SellerSubscriber[] = [
  {
    id: '1',
    email: 'user1@example.com',
    serverId: '1',
    serverName: 'Premium Germany Server',
    plan: 'monthly',
    startDate: '2024-10-15',
    endDate: '2024-11-15',
    isActive: true,
    totalPaid: 36,
    lastLogin: '2024-11-12',
    country: 'Германия',
    flag: '🇩🇪'
  },
  {
    id: '2',
    email: 'john.doe@gmail.com',
    serverId: '2',
    serverName: 'Enterprise USA East',
    plan: 'yearly',
    startDate: '2024-01-10',
    endDate: '2025-01-10',
    isActive: true,
    totalPaid: 240,
    lastLogin: '2024-11-13',
    country: 'США',
    flag: '🇺🇸'
  },
  {
    id: '3',
    email: 'alice.smith@outlook.com',
    serverId: '1',
    serverName: 'Premium Germany Server',
    plan: 'monthly',
    startDate: '2024-09-20',
    endDate: '2024-10-20',
    isActive: false,
    totalPaid: 12,
    lastLogin: '2024-10-18',
    country: 'Германия',
    flag: '🇩🇪'
  }
];

const mockSalesData: SalesData[] = [
  { date: '2024-11-01', revenue: 450, subscribers: 12, refunds: 1 },
  { date: '2024-11-02', revenue: 380, subscribers: 8, refunds: 0 },
  { date: '2024-11-03', revenue: 620, subscribers: 15, refunds: 2 },
  { date: '2024-11-04', revenue: 290, subscribers: 6, refunds: 0 },
  { date: '2024-11-05', revenue: 510, subscribers: 11, refunds: 1 },
  { date: '2024-11-06', revenue: 720, subscribers: 18, refunds: 0 },
  { date: '2024-11-07', revenue: 340, subscribers: 7, refunds: 1 },
  { date: '2024-11-08', revenue: 460, subscribers: 13, refunds: 0 },
  { date: '2024-11-09', revenue: 590, subscribers: 14, refunds: 2 },
  { date: '2024-11-10', revenue: 680, subscribers: 16, refunds: 1 },
  { date: '2024-11-11', revenue: 420, subscribers: 9, refunds: 0 },
  { date: '2024-11-12', revenue: 530, subscribers: 12, refunds: 0 },
  { date: '2024-11-13', revenue: 390, subscribers: 8, refunds: 1 },
  { date: '2024-11-14', revenue: 610, subscribers: 15, refunds: 0 }
];

// API функции для продавца

// Получение статистики продавца
export async function getSellerStats(): Promise<SellerStats> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const stats: SellerStats = {
    totalServers: mockSellerServers.length,
    activeServers: mockSellerServers.filter(s => s.isActive).length,
    totalSubscribers: mockSellerServers.reduce((sum, s) => sum + s.totalSubscribers, 0),
    activeSubscribers: mockSellerServers.reduce((sum, s) => sum + s.activeSubscribers, 0),
    totalRevenue: mockSellerServers.reduce((sum, s) => sum + s.totalRevenue, 0),
    monthlyRevenue: mockSellerServers.reduce((sum, s) => sum + s.monthlyRevenue, 0),
    averageRating: 4.7,
    totalReviews: 127,
    conversionRate: 23.5,
    churnRate: 8.2
  };
  
  return stats;
}

// Получение списка серверов продавца
export async function getSellerServers(): Promise<SellerServer[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...mockSellerServers];
}

// Получение подписчиков продавца
export async function getSellerSubscribers(): Promise<SellerSubscriber[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockSellerSubscribers];
}

// Получение данных о продажах за период
export async function getSalesData(days: number = 30): Promise<SalesData[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  // Возвращаем только нужное количество дней, но не больше чем есть в данных
  const requestedDays = Math.min(days, mockSalesData.length);
  return mockSalesData.slice(-requestedDays);
}

// Создание нового сервера
export async function createServer(serverData: CreateServerForm): Promise<SellerServer> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  const newServer: SellerServer = {
    id: (mockSellerServers.length + 1).toString(),
    ...serverData,
    flag: getFlagByCountryCode(serverData.countryCode),
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    port: 51820,
    currentConnections: 0,
    ping: Math.floor(Math.random() * 30) + 5,
    uptime: 100,
    isOnline: false,
    isActive: false,
    createdAt: new Date().toISOString().split('T')[0],
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    status: 'setup',
    protocols: ['WireGuard', 'OpenVPN']
  };
  
  mockSellerServers.push(newServer);
  console.log('Создан новый сервер:', newServer);
  
  return newServer;
}

// Обновление сервера
export async function updateServer(serverId: string, updates: Partial<SellerServer>): Promise<SellerServer> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const serverIndex = mockSellerServers.findIndex(s => s.id === serverId);
  if (serverIndex === -1) {
    throw new Error('Сервер не найден');
  }
  
  mockSellerServers[serverIndex] = { ...mockSellerServers[serverIndex], ...updates };
  console.log('Сервер обновлен:', mockSellerServers[serverIndex]);
  
  return mockSellerServers[serverIndex];
}

// Удаление сервера
export async function deleteServer(serverId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const serverIndex = mockSellerServers.findIndex(s => s.id === serverId);
  if (serverIndex === -1) {
    throw new Error('Сервер не найден');
  }
  
  mockSellerServers.splice(serverIndex, 1);
  console.log('Сервер удален:', serverId);
}

// Переключение статуса сервера
export async function toggleServerStatus(serverId: string): Promise<SellerServer> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const server = mockSellerServers.find(s => s.id === serverId);
  if (!server) {
    throw new Error('Сервер не найден');
  }
  
  server.isActive = !server.isActive;
  server.isOnline = server.isActive;
  server.status = server.isActive ? 'active' : 'inactive';
  
  console.log(`Статус сервера ${server.name} изменен на: ${server.status}`);
  
  return server;
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

// Шаг 1: Проверка подключения к серверу
export async function checkServerConnection(connectionData: ServerConnectionData): Promise<ServerConnectionResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Мок-логика проверки
  const isValidIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(connectionData.ip);
  const hasPassword = connectionData.rootPassword.length >= 6;
  
  if (!isValidIP) {
    return {
      success: false,
      error: 'Неверный формат IP-адреса'
    };
  }
  
  if (!hasPassword) {
    return {
      success: false,
      error: 'Пароль должен содержать минимум 6 символов'
    };
  }
  
  // Моки всегда успешны для демонстрации
  // if (Math.random() < 0.2) {
  //   return {
  //     success: false,
  //     error: 'Не удается подключиться к серверу. Проверьте IP-адрес и пароль.'
  //   };
  // }
  
  // Успешное подключение
  const regions = ['Frankfurt', 'New York', 'London', 'Singapore', 'Toronto'];
  const providers = ['DigitalOcean', 'AWS', 'Linode', 'Vultr', 'Hetzner'];
  
  return {
    success: true,
    serverInfo: {
      ip: connectionData.ip,
      os: 'Ubuntu 22.04 LTS',
      region: regions[Math.floor(Math.random() * regions.length)],
      provider: providers[Math.floor(Math.random() * providers.length)]
    }
  };
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
  
  return result;
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
  
  return result;
}

// Обратная совместимость
export async function deployWireGuard(serverIp: string): Promise<WireGuardDeploymentResult> {
  return deployWireGuardWithProgress(serverIp, () => {});
}

export async function testServerReadiness(serverIp: string): Promise<ServerTestingResult> {
  return testServerReadinessWithProgress(serverIp, () => {});
}

// Шаг 4: Создание VPN-сервиса
export async function createVpnService(config: VpnServiceConfig, serverIp: string): Promise<SellerServer> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const newServer: SellerServer = {
    id: Date.now().toString(),
    name: config.name,
    country: config.country,
    countryCode: config.countryCode,
    flag: getFlagByCountryCode(config.countryCode),
    city: config.city,
    ip: serverIp,
    port: 51820,
    plan: config.plan,
    monthlyPrice: config.monthlyPrice,
    yearlyPrice: config.yearlyPrice,
    maxConnections: config.maxConnections,
    currentConnections: 0,
    bandwidth: config.bandwidth,
    speed: config.speed,
    ping: Math.floor(Math.random() * 30) + 5,
    uptime: 100,
    isOnline: true,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    status: 'active',
    features: config.features,
    protocols: config.protocols,
    description: config.description
  };
  
  // Добавляем в мок-массив серверов
  mockSellerServers.push(newServer);
  console.log('Создан новый VPN-сервис:', newServer);
  
  return newServer;
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