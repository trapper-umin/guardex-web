import React from 'react';
import { BarChart3, Server, DollarSign, Users, TrendingUp } from 'lucide-react';

export type SellerTabType = 'overview' | 'servers' | 'plans' | 'subscribers' | 'analytics';

interface SellerTabNavigationProps {
  activeTab: SellerTabType;
  onTabChange: (tab: SellerTabType) => void;
}

export const SellerTabNavigation: React.FC<SellerTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'overview' as const, name: 'Обзор', icon: BarChart3 },
    { id: 'servers' as const, name: 'Серверы', icon: Server },
    { id: 'plans' as const, name: 'Планы', icon: DollarSign },
    { id: 'subscribers' as const, name: 'Подписчики', icon: Users },
    { id: 'analytics' as const, name: 'Аналитика', icon: TrendingUp }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex overflow-x-auto scrollbar-hide">
        <div className="flex min-w-full sm:min-w-0">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex-shrink-0 sm:flex-shrink sm:flex-grow-0 px-3 sm:px-8 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-base transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ minWidth: '72px' }}
              >
                {/* Мобильная версия: иконка + текст вертикально */}
                <div className="flex flex-col items-center gap-1 sm:hidden">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </div>
                
                {/* Десктопная версия: иконка + текст горизонтально */}
                <div className="hidden sm:flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
