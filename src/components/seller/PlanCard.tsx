import React from 'react';
import { Star } from 'lucide-react';
import type { SubscriptionPlan } from '../../utils/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onToggleStatus: (planId: string) => void;
  onDelete: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{plan.serverFlag}</span>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">{plan.name}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{plan.serverName}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${plan.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Тип:</span>
          <span className={`font-medium px-2 py-1 rounded text-xs ${
            plan.type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
            plan.type === 'premium' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {plan.type === 'enterprise' ? 'Enterprise' : plan.type === 'premium' ? 'Premium' : 'Basic'}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Цены:</span>
          <span className="text-gray-900 font-medium">${plan.monthlyPrice}/мес, ${plan.yearlyPrice}/год</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Подключения:</span>
          <span className="text-gray-900 font-medium">{plan.maxConnections}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Подписчики:</span>
          <span className="text-blue-600 font-bold">{plan.activeSubscribers}/{plan.maxConnections}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Месячный доход:</span>
          <span className="text-green-600 font-bold">${plan.monthlyRevenue}</span>
        </div>
        {plan.isPopular && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
            <span className="text-xs text-yellow-800 font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              Популярный
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onToggleStatus(plan.id)}
          className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
            plan.isActive
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          }`}
        >
          {plan.isActive ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};


