import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

const HeroSection: React.FC = () => {
  return (
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
  );
};

export default HeroSection;
