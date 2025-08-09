import React from 'react';
import { Lock, BadgeCheck, CreditCard, Phone } from 'lucide-react';

const TrustSection: React.FC = () => {
  return (
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
            <Lock className="w-10 h-10 mx-auto mb-3 text-white" aria-hidden="true" />
            <h4 className="text-white font-semibold mb-2">Шифрование</h4>
            <p className="text-gray-400 text-sm">AES-256 + WireGuard</p>
          </div>
          <div className="text-center">
            <BadgeCheck className="w-10 h-10 mx-auto mb-3 text-white" aria-hidden="true" />
            <h4 className="text-white font-semibold mb-2">Лицензии</h4>
            <p className="text-gray-400 text-sm">Полностью легально</p>
          </div>
          <div className="text-center">
            <CreditCard className="w-10 h-10 mx-auto mb-3 text-white" aria-hidden="true" />
            <h4 className="text-white font-semibold mb-2">Платежи</h4>
            <p className="text-gray-400 text-sm">Stripe, PayPal, криптовалюты</p>
          </div>
          <div className="text-center">
            <Phone className="w-10 h-10 mx-auto mb-3 text-white" aria-hidden="true" />
            <h4 className="text-white font-semibold mb-2">Поддержка</h4>
            <p className="text-gray-400 text-sm">24/7 техподдержка</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
