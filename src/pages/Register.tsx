import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { register as apiRegister } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { buttonStyles, inputStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';
import { Footer } from '../components';

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
  const [isAnimated, setIsAnimated] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    // Запускаем анимации после монтирования компонента
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Данные для регистрации:', data);
      
      // Регистрируем пользователя и получаем полный ответ с токеном и данными пользователя
      const response = await apiRegister(data.email, data.password);
      
      // Обновляем контекст авторизации с полученным токеном
      await login(data.email, response.token);
      
      console.log('Регистрация и автоматический вход успешны!', response.user);
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
    <>
      <div className="min-h-screen flex relative overflow-hidden">
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating элементы */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
        </div>

        {/* Левый информационный блок - скрыт на мобилке */}
        <div className="hidden lg:flex lg:w-1/2 relative z-10">
          <div className="flex flex-col justify-center px-12 xl:px-16 text-white relative">
            <div className={`mb-8 transition-all duration-800 ${isAnimated ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-1 border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium">Инновационная VPN-платформа</span>
              </div>
              <h1 className="text-4xl xl:text-6xl font-black mb-5 py-1 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                guardex
              </h1>
              <div className="text-2xl xl:text-3xl font-bold mb-4 text-blue-100">
                маркетплейс VPN
              </div>
              <p className="text-lg xl:text-xl text-blue-100 leading-relaxed">
                Профессиональная платформа, объединяющая продавцов и покупателей VPN-серверов. 
                Зарабатывайте на инфраструктуре или получите премиум-защиту.
              </p>
            </div>
            
            <div className={`space-y-6 transition-all duration-800 delay-300 ${isAnimated ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
              <div className="group flex items-start p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-200 transition-colors">Максимальная безопасность</h3>
                  <p className="text-blue-100">AES-256 шифрование и zero-log политика</p>
                </div>
              </div>
              
              <div className="group flex items-start p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7C3 8.1 3.9 9 5 9H8V11C8 11.55 8.45 12 9 12S10 11.55 10 11V9H11V16H6V14C6 13.45 5.55 13 5 13S4 13.45 4 13V16C4 17.1 4.9 18 6 18H18C19.1 18 20 17.1 20 16V13C20 12.45 19.55 12 19 12S18 12.45 18 13V14H13V9H14C14.55 9 15 8.55 15 8V6C15 5.45 14.55 5 14 5H13V3C13 2.45 12.55 2 12 2ZM19 19H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V19Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">Стабильный доход</h3>
                  <p className="text-blue-100">До $5,000/месяц от продажи VPN-серверов</p>
                </div>
              </div>
              
              <div className="group flex items-start p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19A7,7 0 0,1 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.94,2.55 2,6.81 2,12A10,10 0 0,0 12,22C15.3,22 18.23,20.39 20.05,17.91L17.45,16.38C16.17,18 14.21,19 12,19Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-purple-200 transition-colors">Высокая производительность</h3>
                  <p className="text-blue-100">До 1 Гбит/с в 50+ премиум-локациях</p>
                </div>
              </div>
            </div>
            
            <div className={`mt-12 grid grid-cols-3 gap-6 transition-all duration-800 delay-600 ${isAnimated ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center group">
                <div className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text group-hover:scale-110 transition-transform duration-300">1000+</div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">VPN серверов</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-black text-transparent bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text group-hover:scale-110 transition-transform duration-300">50+</div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">стран мира</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-black text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">поддержка</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Правый блок с формой */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white/95 backdrop-blur-sm relative z-10">
          <div className={`w-full max-w-md space-y-8 transition-all duration-800 delay-200 ${isAnimated ? 'animate-fade-in-right' : 'opacity-0 translate-x-8'}`}>
            <div className="text-center">
              <div className="lg:hidden mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
                <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
                  guardex
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Создать аккаунт
              </h2>
              <p className="text-gray-600">
                Получите доступ к персональному VPN
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email поле */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Email адрес
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${errors.email 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:bg-blue-50/50'
                    } backdrop-blur-sm`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 animate-shake flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Пароль */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Пароль
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${errors.password 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:bg-blue-50/50'
                    } backdrop-blur-sm`}
                    placeholder="Минимум 6 символов"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 animate-shake flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Подтверждение пароля */}
                <div className="group">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Подтвердите пароль
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:bg-blue-50/50'
                    } backdrop-blur-sm`}
                    placeholder="Повторите пароль"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 animate-shake flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Кнопка регистрации */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden group ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center relative z-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        <span>Создание аккаунта...</span>
                      </div>
                    ) : (
                      <span className="relative z-10">
                        Создать аккаунт
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Ссылка на вход */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Уже есть аккаунт?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 inline-block transform"
                  >
                    Войти в систему
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Дополнительная информация для мобилки */}
            <div className="lg:hidden text-center text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <p>
                Присоединяйтесь к профессиональному VPN-маркетплейсу
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="minimal" />
    </>
  );
};

export default Register; 