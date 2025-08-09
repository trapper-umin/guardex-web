import React from 'react';
import { UserPlus, Settings, CheckCircle2 } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  return (
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
              <UserPlus className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Регистрация</h3>
            <p className="text-gray-600">
              Создайте аккаунт и выберите роль: продавец или покупатель VPN
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Настройка</h3>
            <p className="text-gray-600">
              Продавцы настраивают серверы, покупатели выбирают подходящие варианты
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Результат</h3>
            <p className="text-gray-600">
              Продавцы получают доход, покупатели — качественный VPN-сервис
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
