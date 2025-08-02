import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';

interface SellerRouteProps {
  children: React.ReactNode;
}

/**
 * Компонент для защиты роутов, доступных только продавцам
 */
const SellerRoute: React.FC<SellerRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Показываем загрузку, пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на логин
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Если пользователь не является продавцом, показываем сообщение об ошибке доступа
  if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ ограничен</h1>
            <p className="text-gray-600 mb-6">
              Для доступа к панели продавца необходимо получить соответствующую роль. 
              Вы можете подать заявку на главной странице.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = ROUTES.DASHBOARD}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Перейти в личный кабинет
              </button>
              <button
                onClick={() => window.location.href = ROUTES.HOME}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь является продавцом или админом, показываем защищенный контент
  return <>{children}</>;
};

export default SellerRoute;