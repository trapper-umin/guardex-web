import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  DollarSign, 
  Users,
  Plus, 
  BarChart3
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ROUTES } from '../../utils/routes';
import type { SellerStats, SubscriptionPlan } from '../../utils/types';
import type { SellerTabType } from './SellerTabNavigation';

interface SellerOverviewProps {
  stats: SellerStats | null;
  plans: SubscriptionPlan[];
  onTabChange: (tab: SellerTabType) => void;
}

export const SellerOverview: React.FC<SellerOverviewProps> = ({
  stats,
  plans,
  onTabChange
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Статистика - адаптивная сетка */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Серверы"
          value={stats?.totalServers || 0}
          subtitle={`${stats?.activeServers || 0} активных`}
          icon={Server}
          gradient="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
          iconColor="bg-blue-600"
          textColor="text-blue-900"
        />

        <StatCard
          title="Подписчики"
          value={stats?.totalSubscribers || 0}
          subtitle={`${stats?.activeSubscribers || 0} активных`}
          icon={Users}
          gradient="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          iconColor="bg-green-600"
          textColor="text-green-900"
        />

        <StatCard
          title="Месячный доход"
          value={`$${stats?.monthlyRevenue || 0}`}
          subtitle={`+${stats?.conversionRate || 0}%`}
          icon={DollarSign}
          gradient="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          iconColor="bg-purple-600"
          textColor="text-purple-900"
        />

        <StatCard
          title="Планы"
          value={plans?.length || 0}
          subtitle={`${plans?.filter(p => p.isActive).length || 0} активных`}
          icon={DollarSign}
          gradient="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
          iconColor="bg-orange-600"
          textColor="text-orange-900"
        />
      </div>

      {/* Быстрые действия */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => navigate(ROUTES.CREATE_SERVER)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Добавить сервер
          </button>
          <button
            onClick={() => onTabChange('plans')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 justify-center"
          >
            <DollarSign className="w-4 h-4" />
            Управление планами
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 justify-center"
          >
            <BarChart3 className="w-4 h-4" />
            Посмотреть аналитику
          </button>
        </div>
      </div>
    </div>
  );
};


