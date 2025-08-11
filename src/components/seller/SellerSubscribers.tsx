import React, { useState } from 'react';
import { Pagination } from './Pagination';
import type { SellerSubscriber } from '../../utils/types';

interface SellerSubscribersProps {
  subscribers: SellerSubscriber[];
  subscriberFilter: 'all' | 'active' | 'inactive';
  subscriberSortBy: 'email' | 'server' | 'date' | 'paid';
  currentSubscriberPage: number;
  subscribersPerPage: number;
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
  onSortChange: (sort: 'email' | 'server' | 'date' | 'paid') => void;
  onPageChange: (page: number) => void;
}

export const SellerSubscribers: React.FC<SellerSubscribersProps> = ({
  subscribers,
  subscriberFilter,
  subscriberSortBy,
  currentSubscriberPage,
  subscribersPerPage,
  onFilterChange,
  onSortChange,
  onPageChange
}) => {
  // Состояние для анимации смены страниц
  const [isPageChanging, setIsPageChanging] = useState(false);

  // Обработчик смены страницы с анимацией
  const handlePageChange = (newPage: number) => {
    if (newPage === currentSubscriberPage || isPageChanging) return;
    
    setIsPageChanging(true);
    
    // Небольшая задержка для анимации
    setTimeout(() => {
      onPageChange(newPage);
      setIsPageChanging(false);
    }, 150);
  };

  // Обработчики свайп-жестов
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSubscriberPage < totalSubscriberPages) {
      handlePageChange(currentSubscriberPage + 1);
    }
    if (isRightSwipe && currentSubscriberPage > 1) {
      handlePageChange(currentSubscriberPage - 1);
    }
  };

  // Фильтрация и сортировка подписчиков
  const getFilteredAndSortedSubscribers = () => {
    let filtered = [...subscribers];

    if (subscriberFilter === 'active') {
      filtered = filtered.filter(sub => sub.isActive);
    } else if (subscriberFilter === 'inactive') {
      filtered = filtered.filter(sub => !sub.isActive);
    }

    filtered.sort((a, b) => {
      switch (subscriberSortBy) {
        case 'email':
          return a.email.localeCompare(b.email);
        case 'server':
          return a.serverName.localeCompare(b.serverName);
        case 'date':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'paid':
          return b.totalPaid - a.totalPaid;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Пагинация подписчиков
  const filteredSubscribers = getFilteredAndSortedSubscribers();
  const totalSubscriberPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const startSubscriberIndex = (currentSubscriberPage - 1) * subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(startSubscriberIndex, startSubscriberIndex + subscribersPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Фильтры и сортировка */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <select
          value={subscriberFilter}
          onChange={(e) => onFilterChange(e.target.value as typeof subscriberFilter)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>

        <select
          value={subscriberSortBy}
          onChange={(e) => onSortChange(e.target.value as typeof subscriberSortBy)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="date">По дате</option>
          <option value="email">По email</option>
          <option value="server">По серверу</option>
          <option value="paid">По сумме</option>
        </select>
      </div>

      {/* Информация о результатах */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Показано {startSubscriberIndex + 1}-{Math.min(startSubscriberIndex + subscribersPerPage, filteredSubscribers.length)} из {filteredSubscribers.length} подписчиков
        </div>
        <div className="hidden sm:block">
          Страница {currentSubscriberPage} из {totalSubscriberPages}
        </div>
      </div>

      {/* Таблица подписчиков - адаптивная */}
      <div 
        className={`subscribers-container bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
          isPageChanging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Мобильная версия - карточки */}
        <div className="block sm:hidden divide-y divide-gray-200">
          {currentSubscribers.map((subscriber) => (
            <div key={subscriber.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{subscriber.flag}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{subscriber.email}</p>
                    <p className="text-xs text-gray-600">{subscriber.serverName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subscriber.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">План: </span>
                  <span className="text-gray-900">{subscriber.planName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Оплачено: </span>
                  <span className="text-green-600 font-medium">${subscriber.totalPaid}</span>
                </div>
                <div>
                  <span className="text-gray-500">Начало: </span>
                  <span className="text-gray-900">{new Date(subscriber.startDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Окончание: </span>
                  <span className="text-gray-900">{new Date(subscriber.endDate).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Десктопная версия - таблица */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сервер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">План</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оплачено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Период</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{subscriber.flag}</span>
                      <div className="text-sm text-gray-900">{subscriber.serverName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {subscriber.planName} ({subscriber.billingCycle === 'monthly' ? 'Месячный' : 'Годовой'})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ${subscriber.totalPaid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(subscriber.startDate).toLocaleDateString('ru-RU')}</div>
                      <div className="text-xs text-gray-500">до {new Date(subscriber.endDate).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация подписчиков */}
      <Pagination
        currentPage={currentSubscriberPage}
        totalPages={totalSubscriberPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};


