import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { buttonStyles, cardStyles } from '../utils/styles';
import { Footer } from '../components';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-blue-200">guardex</span> — маркетплейс VPN
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-blue-100">
            Первая платформа, где продавцы VPN встречают покупателей. 
            Запускайте серверы или выбирайте идеальный VPN из сотен вариантов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={ROUTES.SELLER_DASHBOARD}
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Начать продавать VPN
            </Link>
            <Link
              to={ROUTES.MARKETPLACE}
              className="border-2 border-white hover:bg-white hover:text-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Найти VPN
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-200">1000+</div>
              <div className="text-blue-100">VPN серверов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-200">50+</div>
              <div className="text-blue-100">стран</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-200">24/7</div>
              <div className="text-blue-100">поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                Для продавцов VPN
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Превратите свои серверы в стабильный доход
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Запускайте VPN-серверы, устанавливайте цены и получайте пассивный доход. 
                Мы обеспечиваем клиентскую базу, платежи и техподдержку.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Автоматические выплаты каждую неделю</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Готовые конфигурации для WireGuard и OpenVPN</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Аналитика и отчёты по продажам</span>
                </div>
              </div>
              <Link
                to={ROUTES.SELLER_DASHBOARD}
                className={`inline-block ${buttonStyles.primary} text-lg px-8 py-4 shadow-lg hover:shadow-xl`}
              >
                Стать продавцом
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">💰</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">До $5000/месяц</div>
                <div className="text-gray-600">средний доход продавца</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">🌍</div>
                  <div className="text-sm font-medium text-gray-900">50+ стран</div>
                  <div className="text-xs text-gray-600">Глобальное покрытие</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-900">До 1 Гбит/с</div>
                  <div className="text-xs text-gray-600">Максимальная скорость</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">💎</div>
                  <div className="text-sm font-medium text-gray-900">От $2/месяц</div>
                  <div className="text-xs text-gray-600">Лучшие цены</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="text-sm font-medium text-gray-900">100% анонимность</div>
                  <div className="text-xs text-gray-600">Без логов</div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                Для покупателей VPN
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Найдите идеальный VPN для ваших задач
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Сравнивайте сотни VPN-серверов по стране, скорости, цене и отзывам. 
                Подключайтесь к лучшим предложениям за секунды.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Мгновенная активация после оплаты</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Тестирование скорости перед покупкой</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Гарантия возврата средств 30 дней</span>
                </div>
              </div>
              <Link
                to={ROUTES.MARKETPLACE}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Выбрать VPN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Как работает платформа
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Простой и понятный процесс для всех участников guardex
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Регистрация</h3>
              <p className="text-gray-600">
                Создайте аккаунт и выберите роль: продавец или покупатель VPN
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Настройка</h3>
              <p className="text-gray-600">
                Продавцы настраивают серверы, покупатели выбирают подходящие варианты
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Результат</h3>
              <p className="text-gray-600">
                Продавцы получают доход, покупатели — качественный VPN-сервис
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Нам доверяют
            </h2>
            <p className="text-gray-300 text-lg">
              Безопасность и надёжность — наши главные приоритеты
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="text-white font-semibold mb-2">Шифрование</h4>
              <p className="text-gray-400 text-sm">AES-256 + WireGuard</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <h4 className="text-white font-semibold mb-2">Лицензии</h4>
              <p className="text-gray-400 text-sm">Полностью легально</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="text-white font-semibold mb-2">Платежи</h4>
              <p className="text-gray-400 text-sm">Stripe, PayPal, криптовалюты</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📞</div>
              <h4 className="text-white font-semibold mb-2">Поддержка</h4>
              <p className="text-gray-400 text-sm">24/7 техподдержка</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Присоединяйтесь к guardex сегодня
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Более 10,000 пользователей уже зарабатывают и экономят с guardex
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.SELLER_DASHBOARD}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Начать зарабатывать
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              У меня есть аккаунт
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 