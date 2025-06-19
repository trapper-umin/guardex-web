import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components';
import { buttonStyles, inputStyles, cardStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';

// Схема валидации для формы входа
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный формат email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Данные для входа:', data);
      
      // Используем новую API функцию для входа
      const token = await apiLogin(data.email, data.password);
      
      // Обновляем контекст авторизации (теперь асинхронно)
      await login(data.email, token);
      
      console.log('Вход успешен!');
      notifications.auth.loginSuccess();
      
      // Перенаправляем в личный кабинет
      navigate(ROUTES.DASHBOARD);
      
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      
      // Обработка ошибок
      if (error.message && error.message.includes('Неверный')) {
        setError('password', { message: 'Неверный email или пароль' });
        notifications.auth.loginError('Неверный email или пароль');
      } else {
        notifications.auth.loginError(error.message || 'Попробуйте позже');
      }
    }
  };

  return (
    <PageWrapper maxWidth="md">
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Вход в аккаунт
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Войдите в свой личный кабинет
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
                  autoComplete="current-password"
                  className={errors.password ? inputStyles.error : inputStyles.base}
                  placeholder="Введите пароль"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Кнопка входа */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${buttonStyles.primary} ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Вход...
                    </div>
                  ) : (
                    'Войти'
                  )}
                </button>
              </div>
            </form>

            {/* Ссылка на регистрацию */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login; 