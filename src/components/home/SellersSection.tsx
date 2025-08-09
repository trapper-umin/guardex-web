import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';
import { buttonStyles } from '../../utils/styles';

const SellersSection: React.FC = () => {
  return (
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
  );
};

export default SellersSection;
