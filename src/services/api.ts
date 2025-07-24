import axios from "axios";
import type { VpnSubscription } from "../utils/types";

// Создаем базовый axios инстанс для будущей интеграции с backend
const api = axios.create({
  baseURL: "/api",
});

// Добавляем автоматическую подстановку токена из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Типы для API ответов
export interface SubscriptionStatus {
  isActive: boolean;
  daysLeft: number;
  expiresAt: string;
  subscriptions: VpnSubscription[];
}

export interface UserProfile {
  email: string;
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

// Mock-функция регистрации
export async function register(email: string, password: string): Promise<void> {
  // Имитация сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Проверяем есть ли уже такой пользователь (в реальности это будет делать backend)
  const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  const existingUser = users.find((user: any) => user.email === email);
  
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  // Добавляем нового пользователя
  users.push({ email, password });
  localStorage.setItem('mockUsers', JSON.stringify(users));
}

// Mock-функция входа
export async function login(email: string, password: string): Promise<string> {
  // Имитация сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  // Проверяем пользователя
  const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Неверный email или пароль');
  }
  
  // Возвращаем mock-токен
  const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('token', mockToken);
  localStorage.setItem('currentUserEmail', email);
  
  return mockToken;
}

// Mock-функция получения профиля
export async function getProfile(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const email = localStorage.getItem('currentUserEmail');
  if (!email) {
    throw new Error('Пользователь не авторизован');
  }
  
  return { email };
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