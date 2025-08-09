import React from 'react';
import { Plus } from 'lucide-react';
import { PlanCard } from './PlanCard';
import { Pagination } from './Pagination';
import type { SubscriptionPlan } from '../../utils/types';

interface SellerPlansProps {
  plans: SubscriptionPlan[];
  planFilter: 'all' | 'active' | 'inactive';
  planSortBy: 'name' | 'server' | 'type' | 'revenue';
  currentPlanPage: number;
  plansPerPage: number;
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
  onSortChange: (sort: 'name' | 'server' | 'type' | 'revenue') => void;
  onPageChange: (page: number) => void;
  onTogglePlanStatus: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onCreatePlan: () => void;
}

export const SellerPlans: React.FC<SellerPlansProps> = ({
  plans,
  planFilter,
  planSortBy,
  currentPlanPage,
  plansPerPage,
  onFilterChange,
  onSortChange,
  onPageChange,
  onTogglePlanStatus,
  onDeletePlan,
  onCreatePlan
}) => {
  // Фильтрация и сортировка планов
  const getFilteredAndSortedPlans = () => {
    let filtered = [...plans];

    if (planFilter === 'active') {
      filtered = filtered.filter(plan => plan.isActive);
    } else if (planFilter === 'inactive') {
      filtered = filtered.filter(plan => !plan.isActive);
    }

    filtered.sort((a, b) => {
      switch (planSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'server':
          return a.serverName.localeCompare(b.serverName);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'revenue':
          return b.monthlyRevenue - a.monthlyRevenue;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Пагинация планов
  const filteredPlans = getFilteredAndSortedPlans();
  const totalPlanPages = Math.ceil(filteredPlans.length / plansPerPage);
  const startPlanIndex = (currentPlanPage - 1) * plansPerPage;
  const currentPlans = filteredPlans.slice(startPlanIndex, startPlanIndex + plansPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Фильтры и сортировка - адаптивные */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={planFilter}
            onChange={(e) => onFilterChange(e.target.value as typeof planFilter)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <select
            value={planSortBy}
            onChange={(e) => onSortChange(e.target.value as typeof planSortBy)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="revenue">По доходу</option>
            <option value="name">По названию</option>
            <option value="server">По серверу</option>
            <option value="type">По типу</option>
          </select>
        </div>

        <button
          onClick={onCreatePlan}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить план
        </button>
      </div>

      {/* Информация о результатах */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Показано {startPlanIndex + 1}-{Math.min(startPlanIndex + plansPerPage, filteredPlans.length)} из {filteredPlans.length} планов
        </div>
        <div className="hidden sm:block">
          Страница {currentPlanPage} из {totalPlanPages}
        </div>
      </div>

      {/* Список планов - адаптивный */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {currentPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onToggleStatus={onTogglePlanStatus}
            onDelete={onDeletePlan}
          />
        ))}
      </div>

      {/* Пагинация планов */}
      <Pagination
        currentPage={currentPlanPage}
        totalPages={totalPlanPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
