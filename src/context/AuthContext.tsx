import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, type AuthUser } from '../services/auth';

// Интерфейс для контекста авторизации
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Если токен есть, пытаемся получить данные пользователя
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            console.log('✅ Сессия восстановлена:', userData);
          } catch (error) {
            // Если токен недействительный, очищаем его
            console.log('⚠️ Недействительный токен, очищаем...');
            authService.logout();
            setUser(null);
          }
        } else {
          console.log('📝 Токен не найден, пользователь не авторизован');
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации авторизации:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Функция входа
  const login = async (_email: string, token: string) => {
    try {
      setIsLoading(true);
      // Сохраняем токен в localStorage через сервис
      localStorage.setItem('authToken', token);
      
      // Получаем профиль пользователя
      const userData = await authService.getProfile();
      setUser(userData);
      console.log('✅ Пользователь авторизован:', userData);
    } catch (error) {
      console.error('❌ Ошибка при авторизации:', error);
      authService.logout();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    authService.logout();
    setUser(null);
    console.log('✅ Пользователь вышел из системы');
  };

  // Вычисляемое значение авторизации
  const isAuthenticated = !!user && !isLoading;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста авторизации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 