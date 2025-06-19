import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components';
import { buttonStyles, cardStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    notifications.auth.logoutSuccess();
    navigate(ROUTES.LOGIN);
  };

  const handleChangePassword = () => {
    notifications.info('Функция изменения пароля будет реализована позже');
  };

  const handleDeleteAccount = () => {
    notifications.warning('Функция удаления аккаунта будет реализована позже');
  };

  return (
    <PageWrapper>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
        Настройки профиля
      </h1>
      
      {/* Информация о пользователе */}
      <div className={`${cardStyles.base} mb-4 sm:mb-6`}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Информация о аккаунте
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">ID пользователя:</span>
            <span className="font-mono text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded break-all">
              {user?.id}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Email:</span>
            <span className="font-semibold text-sm sm:text-base break-all text-gray-900">{user?.email}</span>
          </div>
          
          {user?.name && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
              <span className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-0">Имя:</span>
              <span className="font-semibold text-sm sm:text-base text-gray-900">{user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Действия */}
      <div className={cardStyles.base}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Управление аккаунтом
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleChangePassword}
            className={`w-full ${buttonStyles.primary}`}
          >
            Изменить пароль
          </button>
          
          <button
            onClick={handleDeleteAccount}
            className={`w-full ${buttonStyles.danger}`}
          >
            Удалить аккаунт
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full ${buttonStyles.secondary}`}
          >
            Выйти из системы
          </button>
        </div>
      </div>
      
      {/* Демонстрация защищённого контента */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
          🔒 Защищённая страница
        </h3>
        <p className="text-green-700 text-sm sm:text-base leading-relaxed">
          Эта страница доступна только авторизованным пользователям. 
          Если вы видите это сообщение, значит защита маршрутов работает корректно!
        </p>
        <p className="text-green-600 text-xs sm:text-sm mt-2 leading-relaxed">
          Попробуйте открыть эту страницу в новой вкладке или обновить страницу — 
          сессия должна автоматически восстановиться.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Settings; 