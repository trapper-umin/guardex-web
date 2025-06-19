import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { buttonStyles, cardStyles } from '../utils/styles';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Безопасный и быстрый VPN — доступ за 1 клик
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Подключайся к надёжному VPN и получай персональный ключ за минуту
          </p>
          <Link
            to={ROUTES.REGISTER}
            className={`inline-block ${buttonStyles.primary} text-lg px-8 py-4 shadow-lg hover:shadow-xl`}
          >
            Начать
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className={`${cardStyles.withHover} text-center`}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Надёжная шифрация с WireGuard
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Современный протокол обеспечивает максимальную безопасность ваших данных
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`${cardStyles.withHover} text-center`}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Выдача ключа сразу после оплаты
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Автоматическая генерация персонального VPN-ключа без ожидания
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`${cardStyles.withHover} text-center`}>
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Личный кабинет и история подключений
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Управляйте подписками и отслеживайте активность в удобном интерфейсе
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Готовы начать?
          </h2>
          <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base">
            Создайте аккаунт и получите доступ к защищённому интернет-соединению уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.REGISTER}
              className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Создать аккаунт
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="border-2 border-white hover:bg-white hover:text-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Войти
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 