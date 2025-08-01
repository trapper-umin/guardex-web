// Сервис аутентификации с интеграцией backend
import { 
  register as apiRegister, 
  login as apiLogin, 
  getProfile as apiGetProfile,
  logout as apiLogout,
  logoutAll as apiLogoutAll,
  getActiveSessions as apiGetActiveSessions,
  revokeSession as apiRevokeSession,
  type LoginResponse, 
  type UserProfile,
  type SessionResponse
} from './api';

// Типы для аутентификации (синхронизированы с backend)
export interface AuthUser {
  id: number;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Сервис аутентификации
export const authService = {
  // Регистрация пользователя
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response: LoginResponse = await apiRegister(data.email, data.password);
      
      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        createdAt: response.user.createdAt,
        isActive: response.user.isActive,
      };
      
      return {
        user: authUser,
        token: response.token,
      };
    } catch (error) {
      console.error('❌ Ошибка регистрации в authService:', error);
      throw error;
    }
  },

  // Вход в систему
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response: LoginResponse = await apiLogin(data.email, data.password);
      
      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        createdAt: response.user.createdAt,
        isActive: response.user.isActive,
      };
      
      return {
        user: authUser,
        token: response.token,
      };
    } catch (error) {
      console.error('❌ Ошибка входа в authService:', error);
      throw error;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await apiLogout();
    } catch (error) {
      console.warn('Ошибка при выходе из системы:', error);
      // Продолжаем локальную очистку, даже если API вызов не удался
    }
  },

  // Получить токен из localStorage
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Проверить, авторизован ли пользователь
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    return !!token;
  },

  // Получить информацию о текущем пользователе
  getCurrentUser: async (): Promise<AuthUser> => {
    try {
      // Сначала пытаемся получить из localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as UserProfile;
        return {
          id: parsedUser.id,
          email: parsedUser.email,
          createdAt: parsedUser.createdAt,
          isActive: parsedUser.isActive,
        };
      }
      
      // Если нет сохраненных данных, запрашиваем с сервера
      const profile: UserProfile = await apiGetProfile();
      return {
        id: profile.id,
        email: profile.email,
        createdAt: profile.createdAt,
        isActive: profile.isActive,
      };
    } catch (error) {
      console.error('❌ Ошибка получения пользователя в authService:', error);
      throw error;
    }
  },

  // Получить профиль пользователя
  getProfile: async (): Promise<AuthUser> => {
    try {
      const profile: UserProfile = await apiGetProfile();
      return {
        id: profile.id,
        email: profile.email,
        createdAt: profile.createdAt,
        isActive: profile.isActive,
      };
    } catch (error) {
      console.error('❌ Ошибка получения профиля в authService:', error);
      throw error;
    }
  },

  // Выход из всех устройств
  logoutAll: async (): Promise<void> => {
    try {
      await apiLogoutAll();
      console.log('✅ Выход из всех устройств выполнен');
    } catch (error) {
      console.error('❌ Ошибка выхода из всех устройств:', error);
      throw error;
    }
  },

  // Получить активные сессии
  getActiveSessions: async (): Promise<SessionResponse[]> => {
    try {
      return await apiGetActiveSessions();
    } catch (error) {
      console.error('❌ Ошибка получения активных сессий:', error);
      throw error;
    }
  },

  // Отозвать конкретную сессию
  revokeSession: async (sessionId: number): Promise<void> => {
    try {
      await apiRevokeSession(sessionId);
      console.log('✅ Сессия отозвана:', sessionId);
    } catch (error) {
      console.error('❌ Ошибка отзыва сессии:', error);
      throw error;
    }
  },

  // Получить refresh токен из localStorage
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  // Проверить наличие refresh токена  
  hasRefreshToken: (): boolean => {
    const refreshToken = authService.getRefreshToken();
    return !!refreshToken;
  },
}; 