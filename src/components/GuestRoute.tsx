import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Показываем загрузку пока проверяем токен
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если авторизован, показываем страницу с уведомлением
  if (isAuthenticated) {
    return <AlreadyAuthorizedPage />;
  }

  // Если не авторизован, показываем дочерние компоненты
  return <>{children}</>;
};

// Компонент для отображения уведомления авторизированным пользователям
const AlreadyAuthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.reload(); // Перезагружаем страницу для обновления состояния
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4 sm:py-12">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <svg
              className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Вы уже авторизованы
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 px-2">
            Вы вошли в систему как <strong className="break-all">{user?.email}</strong>
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Доступные действия:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <Link
                to={ROUTES.DASHBOARD}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center text-sm sm:text-base"
              >
                Перейти в личный кабинет
              </Link>
              
              <Link
                to={ROUTES.HOME}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-center text-sm sm:text-base"
              >
                На главную страницу
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
              Хотите войти под другим аккаунтом?
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GuestRoute; 