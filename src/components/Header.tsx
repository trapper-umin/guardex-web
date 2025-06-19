import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { notifications } from '../utils/notifications';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    notifications.auth.logoutSuccess();
    navigate(ROUTES.LOGIN);
    setIsMobileMenuOpen(false); // Закрываем мобильное меню
  };

  // Функция для стилей активной ссылки в десктопе
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;

  // Функция для стилей активной ссылки в мобильном меню
  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link 
              to={ROUTES.HOME}
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              onClick={closeMobileMenu}
            >
              VPNx
            </Link>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              // Неавторизованный пользователь
              <>
                <NavLink
                  to={ROUTES.HOME}
                  className={getNavLinkClass}
                >
                  Главная
                </NavLink>
                <NavLink
                  to={ROUTES.LOGIN}
                  className={getNavLinkClass}
                >
                  Войти
                </NavLink>
                <NavLink
                  to={ROUTES.REGISTER}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Регистрация
                </NavLink>
              </>
            ) : (
              // Авторизованный пользователь
              <>
                <NavLink
                  to={ROUTES.HOME}
                  className={getNavLinkClass}
                >
                  Главная
                </NavLink>
                <NavLink
                  to={ROUTES.DASHBOARD}
                  className={getNavLinkClass}
                >
                  Личный кабинет
                </NavLink>
                <NavLink
                  to={ROUTES.SETTINGS}
                  className={getNavLinkClass}
                >
                  Настройки
                </NavLink>
                
                {/* Информация о пользователе - только на больших экранах */}
                <div className="hidden lg:flex items-center space-x-3">
                  <span className="text-sm text-gray-600 truncate max-w-32">
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Выйти
                  </button>
                </div>
                
                {/* Только кнопка выхода на средних экранах */}
                <div className="lg:hidden">
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Выйти
                  </button>
                </div>
              </>
            )}
          </nav>

          {/* Кнопка мобильного меню */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Открыть главное меню</span>
              {/* Иконка гамбургера */}
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {!isAuthenticated ? (
              // Неавторизованный пользователь
              <>
                <NavLink
                  to={ROUTES.HOME}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Главная
                </NavLink>
                <NavLink
                  to={ROUTES.LOGIN}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Войти
                </NavLink>
                <NavLink
                  to={ROUTES.REGISTER}
                  className="block w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Регистрация
                </NavLink>
              </>
            ) : (
              // Авторизованный пользователь
              <>
                {/* Информация о пользователе в мобильном меню */}
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <div className="text-base font-medium text-gray-800">Пользователь</div>
                  <div className="text-sm text-gray-600 truncate">{user?.email}</div>
                </div>
                
                <NavLink
                  to={ROUTES.HOME}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Главная
                </NavLink>
                <NavLink
                  to={ROUTES.DASHBOARD}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Личный кабинет
                </NavLink>
                <NavLink
                  to={ROUTES.SETTINGS}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Настройки
                </NavLink>
                
                {/* Кнопка выхода в мобильном меню */}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  Выйти из аккаунта
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 