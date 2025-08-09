import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

const FinalCtaSection: React.FC = () => {
  return (
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
  );
};

export default FinalCtaSection;
