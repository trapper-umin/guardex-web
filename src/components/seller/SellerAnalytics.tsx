import React, { useState } from 'react';
import { BarChart3, DollarSign, Users, TrendingUp } from 'lucide-react';
import type { SalesData } from '../../utils/types';

interface SellerAnalyticsProps {
  salesData: SalesData[];
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({
  salesData
}) => {
  // Состояние для тултипов графика
  const [hoveredDay, setHoveredDay] = useState<SalesData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; showBelow?: boolean } | null>(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Продажи за последние 14 дней</h3>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 relative">
        {/* График - адаптивный */}
        <div className="relative" style={{ height: '320px' }}>
          <div className="absolute bottom-8 left-0 right-0 flex items-end justify-start space-x-1 sm:space-x-2 overflow-x-auto" style={{ height: '240px' }}>
            {salesData.length > 0 ? (
              salesData.map((day) => {
                const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1); // Минимум 1 чтобы избежать деления на 0
                const heightPx = Math.max((day.revenue / maxRevenue) * 200, 8); // Высота в пикселях от 8px до 200px
                
                return (
                  <div
                    key={day.date}
                    className="relative flex flex-col items-center cursor-pointer"
                    style={{ width: '32px' }}
                    onMouseEnter={(e) => {
                      setHoveredDay(day);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const tooltipWidth = 200; // приблизительная ширина тултипа
                      const tooltipHeight = 100; // приблизительная высота тултипа
                      
                      let x = rect.left + rect.width / 2;
                      let y = rect.top - 10;
                      let showBelow = false;
                      
                      // Проверяем, не выходит ли тултип за левую границу
                      if (x - tooltipWidth / 2 < 10) {
                        x = tooltipWidth / 2 + 10;
                      }
                      
                      // Проверяем, не выходит ли тултип за правую границу
                      if (x + tooltipWidth / 2 > window.innerWidth - 10) {
                        x = window.innerWidth - tooltipWidth / 2 - 10;
                      }
                      
                      // Проверяем, не выходит ли тултип за верхнюю границу
                      if (y - tooltipHeight < 10) {
                        y = rect.bottom + 10; // показываем под столбиком
                        showBelow = true;
                      }
                      
                      setTooltipPosition({ x, y, showBelow });
                    }}
                    onMouseLeave={() => {
                      setHoveredDay(null);
                      setTooltipPosition(null);
                    }}
                  >
                    <div
                      className={`w-full min-w-[20px] sm:min-w-[28px] max-w-[40px] rounded-t-lg transition-all duration-300 ${
                        hoveredDay?.date === day.date
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg transform scale-105'
                          : 'bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400'
                      }`}
                      style={{ height: `${heightPx}px` }}
                    ></div>
                    <div className="mt-2 text-xs text-gray-600 transform -rotate-45 sm:rotate-0 whitespace-nowrap origin-center">
                      {new Date(day.date).toLocaleDateString('ru-RU', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p>Нет данных для отображения</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Тултип при наведении */}
        {hoveredDay && tooltipPosition && (
          <div 
            className={`fixed bg-gray-900 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none transform -translate-x-1/2 ${
              tooltipPosition.showBelow ? '' : '-translate-y-full'
            }`}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`
            }}
          >
            <div className="text-sm font-medium">
              {new Date(hoveredDay.date).toLocaleDateString('ru-RU', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs mt-1 space-y-1">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Доход: <span className="font-bold text-green-400">${hoveredDay.revenue}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Подписчики: <span className="font-bold text-blue-400">{hoveredDay.subscribers}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 rotate-180" />
                Возвраты: <span className="font-bold text-red-400">{hoveredDay.refunds}</span>
              </div>
            </div>
            {/* Стрелка */}
            {tooltipPosition.showBelow ? (
              // Стрелка вверх (когда тултип снизу)
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
              </div>
            ) : (
              // Стрелка вниз (когда тултип сверху)
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        )}

        {/* Суммарная статистика */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                ${salesData.length > 0 ? salesData.reduce((sum, day) => sum + day.revenue, 0) : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Общий доход за {salesData.length} дней</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {salesData.length > 0 ? salesData.reduce((sum, day) => sum + day.subscribers, 0) : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Новые подписчики</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {salesData.length > 0 ? salesData.reduce((sum, day) => sum + day.refunds, 0) : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Возвраты</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

