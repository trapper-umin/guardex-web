// Mock сервис аутентификации для разработки
// В реальном приложении здесь будут вызовы к API

// Типы для аутентификации
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
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

// Mock база данных пользователей (в реальном приложении это будет на сервере)
interface MockUser {
  id: string;
  email: string;
  password: string;
  name?: string;
}

const mockUsers: MockUser[] = [];

// Функция для создания mock токена
const createMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Функция для имитации задержки сети
const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Сервис аутентификации
export const authService = {
  // Регистрация пользователя
  register: async (data: RegisterData): Promise<AuthResponse> => {
    await mockDelay(); // Имитируем задержку сети
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = mockUsers.find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Создаем нового пользователя
    const newUser: MockUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      password: data.password, // В реальном приложении пароль должен быть хешированным
    };
    
    mockUsers.push(newUser);
    
    const token = createMockToken(newUser.id);
    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    
    // Сохраняем токен в localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUserEmail', newUser.email);
    
    console.log('✅ Mock регистрация успешна:', { email: data.email, token });
    
    return {
      user: authUser,
      token,
    };
  },

  // Вход в систему
  login: async (data: LoginData): Promise<AuthResponse> => {
    await mockDelay(); // Имитируем задержку сети
    
    // Ищем пользователя по email и паролю
    const user = mockUsers.find(
      u => u.email === data.email && u.password === data.password
    );
    
    if (!user) {
      throw new Error('Неверный email или пароль');
    }
    
    const token = createMockToken(user.id);
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    
    // Сохраняем токен и email в localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUserEmail', user.email);
    
    console.log('✅ Mock вход успешен:', { email: data.email, token });
    
    return {
      user: authUser,
      token,
    };
  },

  // Выход из системы
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserEmail');
    console.log('✅ Mock выход из системы');
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

  // Получить информацию о текущем пользователе (mock)
  getCurrentUser: async (): Promise<AuthUser> => {
    await mockDelay(200);
    
    const token = authService.getToken();
    if (!token) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Извлекаем userId из токена (в реальном приложении это делалось бы на сервере)
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      throw new Error('Недействительный токен');
    }
    
    const userId = tokenParts[2];
    
    // Ищем пользователя в нашей mock базе данных
    const user = mockUsers.find(u => u.id.includes(userId) || token.includes(u.id));
    
    if (!user) {
      // Пытаемся получить email из localStorage
      const savedEmail = localStorage.getItem('currentUserEmail');
      if (!savedEmail) {
        throw new Error('Сессия истекла, необходимо войти снова');
      }
      
      console.log('⚠️ Пользователь не найден в базе, используем сохранённый email');
      return {
        id: userId,
        email: savedEmail,
      };
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  },

  // Получить профиль пользователя (псевдоним для getCurrentUser)
  getProfile: async (): Promise<AuthUser> => {
    return authService.getCurrentUser();
  },
}; 