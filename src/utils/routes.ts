// Константы для роутинга приложения

export const ROUTES = {
  HOME: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRICING: '/pricing',
  MARKETPLACE: '/marketplace',
} as const;

// Типы для TypeScript
export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey]; 