import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { notifications } from '../utils/notifications';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [dropdownTimeoutId, setDropdownTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    logout();
    notifications.auth.logoutSuccess();
    navigate(ROUTES.LOGIN);
    setIsMobileMenuOpen(false);
  };

  // Функция для стилей активной ссылки в десктопе
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm ${
      isActive
        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform hover:scale-105'
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 hover:backdrop-blur-md'
    }`;

  // Проверка активности настроек (включая подпути)
  const isSettingsActive = location.pathname.startsWith('/settings');

  // Функции для управления выпадающим меню с задержкой
  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutId) {
      clearTimeout(dropdownTimeoutId);
      setDropdownTimeoutId(null);
    }
    setIsSettingsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    const timeoutId = setTimeout(() => {
      setIsSettingsDropdownOpen(false);
    }, 150); // 150ms задержка
    setDropdownTimeoutId(timeoutId);
  };

  // Функция для стилей активной ссылки в мобильном меню
  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
      isActive
        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Очистка таймаута при размонтировании компонента
  useEffect(() => {
    return () => {
      if (dropdownTimeoutId) {
        clearTimeout(dropdownTimeoutId);
      }
    };
  }, [dropdownTimeoutId]);

  // Закрытие выпадающего меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isSettingsDropdownOpen && !target.closest('[data-dropdown="settings"]')) {
        setIsSettingsDropdownOpen(false);
        if (dropdownTimeoutId) {
          clearTimeout(dropdownTimeoutId);
          setDropdownTimeoutId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsDropdownOpen, dropdownTimeoutId]);

  return (
    <header className="sticky top-0 z-50 relative">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-lg"></div>
      </div>
      
      {/* Floating элементы */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-2 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-blob"></div>
        <div className="absolute -top-2 right-10 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link 
              to={ROUTES.HOME}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              onClick={closeMobileMenu}
            >
              guardex
            </Link>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
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
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10">Регистрация</span>
                </NavLink>
              </>
            ) : (
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
                  Кабинет
                </NavLink>
                <NavLink
                  to={ROUTES.MARKETPLACE}
                  className={getNavLinkClass}
                >
                  Маркетплейс
                </NavLink>
                
                {/* Выпадающее меню настроек */}
                <div 
                  className="relative"
                  data-dropdown="settings"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <button
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm ${
                      isSettingsActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform hover:scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 hover:backdrop-blur-md'
                    }`}
                    onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                  >
                    <div className="flex items-center">
                      Настройки
                      <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isSettingsDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                  
                  {/* Выпадающее меню */}
                  {isSettingsDropdownOpen && (
                    <>
                      {/* Невидимый мостик для курсора */}
                      <div className="absolute top-full left-0 w-52 h-2 z-40"></div>
                      <div className="absolute top-full left-0 mt-0.5 w-52 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                      <Link
                        to={ROUTES.SETTINGS}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => {
                          if (dropdownTimeoutId) {
                            clearTimeout(dropdownTimeoutId);
                            setDropdownTimeoutId(null);
                          }
                          setIsSettingsDropdownOpen(false);
                        }}
                      >
                        <span className="mr-3">🔧</span>
                        Основные настройки
                      </Link>
                      <Link
                        to={ROUTES.SESSIONS}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => {
                          if (dropdownTimeoutId) {
                            clearTimeout(dropdownTimeoutId);
                            setDropdownTimeoutId(null);
                          }
                          setIsSettingsDropdownOpen(false);
                        }}
                      >
                        <span className="mr-3">📱</span>
                        Управление сессиями
                      </Link>
                    </div>
                    </>
                  )}
                </div>
                
                {/* Информация о пользователе */}
                <div className="hidden lg:flex items-center space-x-3 ml-4">
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 font-medium truncate max-w-32">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-white/80 hover:bg-white backdrop-blur-sm text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-white/30 hover:border-red-200 hover:shadow-lg transform hover:scale-105"
                  >
                    Выйти
                  </button>
                </div>
                
                {/* Только кнопка выхода на средних экранах */}
                <div className="lg:hidden">
                  <button
                    onClick={handleLogout}
                    className="bg-white/80 hover:bg-white backdrop-blur-sm text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-white/30 hover:border-red-200"
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
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300 border border-white/30"
              aria-expanded="false"
            >
              <span className="sr-only">Открыть главное меню</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
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
                  strokeWidth="2"
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
        <div className="md:hidden relative z-10">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-lg border-t border-white/30">
            {!isAuthenticated ? (
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
                  className="block w-full text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg transition-all duration-300 relative overflow-hidden group"
                  onClick={closeMobileMenu}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10">Регистрация</span>
                </NavLink>
              </>
            ) : (
              <>
                {/* Информация о пользователе в мобильном меню */}
                <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="text-base font-semibold text-gray-800">Пользователь</div>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">{user?.email}</div>
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
                  to={ROUTES.MARKETPLACE}
                  className={getMobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  Маркетплейс
                </NavLink>
                
                {/* Группа настроек в мобильном меню */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Настройки
                  </div>
                  <NavLink
                    to={ROUTES.SETTINGS}
                    className={getMobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    🔧 Основные настройки
                  </NavLink>
                  <NavLink
                    to={ROUTES.SESSIONS}
                    className={getMobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    📱 Управление сессиями
                  </NavLink>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 backdrop-blur-sm border border-red-200 hover:border-red-500 transition-all duration-300"
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