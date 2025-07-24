import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';

interface FooterProps {
  variant?: 'full' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ variant = 'full' }) => {
  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-900 relative overflow-hidden">
        {/* Floating элементы */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-16 h-16 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-12 h-12 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-xl animate-blob animation-delay-3000"></div>
        </div>

        <div className="relative z-10 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to={ROUTES.HOME}
              className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 inline-block mb-4"
            >
              guardex
            </Link>
            <p className="text-gray-300 text-lg mb-6">
              Профессиональный VPN-маркетплейс
            </p>
            
            {/* Статистика */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1000+</div>
                <div className="text-sm text-gray-400">серверов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">50+</div>
                <div className="text-sm text-gray-400">стран</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">поддержка</div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 text-sm">
                © 2025 guardex. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 relative overflow-hidden">
      {/* Floating элементы */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-20 w-24 h-24 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-xl animate-blob"></div>
        <div className="absolute top-10 right-20 w-20 h-20 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-16 h-16 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-xl animate-blob animation-delay-3000"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Основной контент футера */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Информация о компании */}
            <div className="md:col-span-2">
              <Link 
                to={ROUTES.HOME}
                className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 inline-block mb-4"
              >
                guardex
              </Link>
              <p className="text-gray-300 text-lg mb-4 max-w-md">
                Первая платформа, объединяющая продавцов и покупателей VPN-серверов. 
                Зарабатывайте на инфраструктуре или получите премиум-защиту.
              </p>
              <div className="flex space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="text-2xl font-bold text-blue-400">1000+</div>
                  <div className="text-xs text-gray-400">серверов</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="text-2xl font-bold text-green-400">50+</div>
                  <div className="text-xs text-gray-400">стран</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="text-2xl font-bold text-purple-400">24/7</div>
                  <div className="text-xs text-gray-400">поддержка</div>
                </div>
              </div>
            </div>

            {/* Быстрые ссылки */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Платформа</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={ROUTES.HOME} className="text-gray-300 hover:text-white transition-colors">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.REGISTER} className="text-gray-300 hover:text-blue-400 transition-colors">
                    Стать продавцом
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.MARKETPLACE} className="text-gray-300 hover:text-blue-400 transition-colors">
                    Купить VPN
                  </Link>
                </li>
              </ul>
            </div>

            {/* Поддержка */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Поддержка</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-300">help@guardex.com</span>
                </li>
                <li>
                  <span className="text-gray-300">Telegram: @guardex_support</span>
                </li>
                <li>
                  <span className="text-gray-300">24/7 онлайн</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Нижняя часть */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 guardex. Все права защищены.
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm">Безопасность:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">AES-256</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">Zero-log</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 