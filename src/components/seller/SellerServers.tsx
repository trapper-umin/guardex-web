import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ServerCard } from './ServerCard';
import { Pagination } from './Pagination';
import { ROUTES } from '../../utils/routes';
import type { SellerServer } from '../../utils/types';

interface SellerServersProps {
  servers: SellerServer[];
  serverFilter: 'all' | 'active' | 'inactive';
  serverSortBy: 'name' | 'country' | 'plan' | 'revenue';
  currentServerPage: number;
  serversPerPage: number;
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
  onSortChange: (sort: 'name' | 'country' | 'plan' | 'revenue') => void;
  onPageChange: (page: number) => void;
  onToggleServerStatus: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
}

export const SellerServers: React.FC<SellerServersProps> = ({
  servers,
  serverFilter,
  serverSortBy,
  currentServerPage,
  serversPerPage,
  onFilterChange,
  onSortChange,
  onPageChange,
  onToggleServerStatus,
  onDeleteServer
}) => {
  const navigate = useNavigate();

  // Состояние для анимации смены страниц
  const [isPageChanging, setIsPageChanging] = useState(false);

  // Обработчик смены страницы с анимацией
  const handlePageChange = (newPage: number) => {
    if (newPage === currentServerPage || isPageChanging) return;
    
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

    if (isLeftSwipe && currentServerPage < totalServerPages) {
      handlePageChange(currentServerPage + 1);
    }
    if (isRightSwipe && currentServerPage > 1) {
      handlePageChange(currentServerPage - 1);
    }
  };

  // Фильтрация и сортировка серверов
  const getFilteredAndSortedServers = () => {
    let filtered = [...servers];

    if (serverFilter === 'active') {
      filtered = filtered.filter(server => server.isActive);
    } else if (serverFilter === 'inactive') {
      filtered = filtered.filter(server => !server.isActive);
    }

    filtered.sort((a, b) => {
      switch (serverSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'country':
          return a.country.localeCompare(b.country);
        case 'plan':
          return (a.plan || '').localeCompare(b.plan || '');
        case 'revenue':
          return b.monthlyRevenue - a.monthlyRevenue;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Пагинация серверов
  const filteredServers = getFilteredAndSortedServers();
  const totalServerPages = Math.ceil(filteredServers.length / serversPerPage);
  const startServerIndex = (currentServerPage - 1) * serversPerPage;
  const currentServers = filteredServers.slice(startServerIndex, startServerIndex + serversPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Фильтры и сортировка - адаптивные */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={serverFilter}
            onChange={(e) => onFilterChange(e.target.value as typeof serverFilter)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <select
            value={serverSortBy}
            onChange={(e) => onSortChange(e.target.value as typeof serverSortBy)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="revenue">По доходу</option>
            <option value="name">По названию</option>
            <option value="country">По стране</option>
            <option value="plan">По плану</option>
          </select>
        </div>

        <button
          onClick={() => navigate(ROUTES.CREATE_SERVER)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить сервер
        </button>
      </div>

      {/* Информация о результатах */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Показано {startServerIndex + 1}-{Math.min(startServerIndex + serversPerPage, filteredServers.length)} из {filteredServers.length} серверов
        </div>
        <div className="hidden sm:block">
          Страница {currentServerPage} из {totalServerPages}
        </div>
      </div>

      {/* Список серверов - адаптивный */}
      <div 
        className={`servers-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300 ${
          isPageChanging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentServers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            onToggleStatus={onToggleServerStatus}
            onDelete={onDeleteServer}
          />
        ))}
      </div>

      {/* Пагинация серверов */}
      <Pagination
        currentPage={currentServerPage}
        totalPages={totalServerPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};


