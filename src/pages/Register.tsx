import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { register as apiRegister, login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components';
import { buttonStyles, inputStyles, cardStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';

// Схема валидации для формы регистрации
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный формат email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z
    .string()
    .min(1, 'Подтверждение пароля обязательно'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Данные для регистрации:', data);
      
      // Сначала регистрируем пользователя
      await apiRegister(data.email, data.password);
      
      // После успешной регистрации сразу авторизуем пользователя
      const token = await apiLogin(data.email, data.password);
      
      // Обновляем контекст авторизации (теперь асинхронно)
      await login(data.email, token);
      
      console.log('Регистрация и вход успешны!');
      notifications.auth.registerSuccess();
      
      // Перенаправляем в личный кабинет
      navigate(ROUTES.DASHBOARD);
      
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      
      // Обработка ошибок
      if (error.message && error.message.includes('уже существует')) {
        setError('email', { message: 'Пользователь с таким email уже существует' });
        notifications.auth.registerError('Пользователь с таким email уже существует');
      } else {
        notifications.auth.registerError(error.message || 'Попробуйте позже');
      }
    }
  };

  return (
    <PageWrapper maxWidth="md">
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Создать аккаунт
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Получите доступ к персональному VPN
            </p>
          </div>
          
          <div className={cardStyles.base}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email поле */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email адрес
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={errors.email ? inputStyles.error : inputStyles.base}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Пароль */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className={errors.password ? inputStyles.error : inputStyles.base}
                  placeholder="Минимум 6 символов"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Подтверждение пароля */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите пароль
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className={errors.confirmPassword ? inputStyles.error : inputStyles.base}
                  placeholder="Повторите пароль"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Кнопка регистрации */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${buttonStyles.primary} ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Регистрация...
                    </div>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </button>
              </div>
            </form>

            {/* Ссылка на вход */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Register; 