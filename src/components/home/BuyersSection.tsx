import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

const BuyersSection: React.FC = () => {
  return (
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
  );
};

export default BuyersSection;
