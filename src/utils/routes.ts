// Константы для роутинга приложения

export const ROUTES = {
  HOME: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SESSIONS: '/sessions',
  PRICING: '/pricing',
  MARKETPLACE: '/marketplace',
  SELLER_DASHBOARD: '/seller',
  CREATE_SERVER: '/seller/create',
} as const;

// Типы для TypeScript
export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey]; 