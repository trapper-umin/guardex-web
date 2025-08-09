import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { Footer } from '../components';
import { notifications } from '../utils/notifications';
import { 
  BarChart3, 
  Server, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import {
  getSellerStats,
  getSellerServers,
  getSellerSubscribers,
  getSalesData,
  toggleServerStatus,
  deleteServer,
  getSellerPlans,
  togglePlanStatus,
  deleteSubscriptionPlan,
  createSubscriptionPlan
} from '../services/api';
import type { SellerServer, SellerStats, SellerSubscriber, SalesData, SubscriptionPlan, CreateSubscriptionPlanForm } from '../utils/types';

const SellerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Основные состояния
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [servers, setServers] = useState<SellerServer[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<SellerSubscriber[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'plans' | 'subscribers' | 'analytics'>('overview');

  // Состояния для серверов
  const [serverFilter, setServerFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [serverSortBy, setServerSortBy] = useState<'name' | 'country' | 'plan' | 'revenue'>('revenue');
  const [currentServerPage, setCurrentServerPage] = useState(1);
  const [serversPerPage] = useState(6);

  // Состояния для планов
  const [planFilter, setPlanFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planSortBy, setPlanSortBy] = useState<'name' | 'server' | 'type' | 'revenue'>('revenue');
  const [currentPlanPage, setCurrentPlanPage] = useState(1);
  const [plansPerPage] = useState(8);

  // Состояния для подписчиков  
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriberSortBy, setSubscriberSortBy] = useState<'email' | 'server' | 'date' | 'paid'>('date');
  const [currentSubscriberPage, setCurrentSubscriberPage] = useState(1);
  const [subscribersPerPage] = useState(8);

  // Состояние для тултипов графика
  const [hoveredDay, setHoveredDay] = useState<SalesData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; showBelow?: boolean } | null>(null);

  // Состояние для модального окна создания плана
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // Загрузка данных
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, serversData, plansData, subscribersData, salesDataResult] = await Promise.all([
        getSellerStats(),
        getSellerServers(),
        getSellerPlans(),
        getSellerSubscribers(),
        getSalesData(14) // Загружаем данные за 14 дней
      ]);
      
      setStats(statsData);
      setServers(serversData);
      setPlans(plansData);
      setSubscribers(subscribersData);
      setSalesData(salesDataResult);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      notifications.general.loadingError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleServerStatus = async (serverId: string) => {
    try {
      const updatedServer = await toggleServerStatus(serverId);
      setServers(prev => prev.map(s => s.id === serverId ? updatedServer : s));
      notifications.general.success('Статус сервера изменен');
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      notifications.general.loadingError();
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот сервер?')) return;
    
    try {
      await deleteServer(serverId);
      setServers(prev => prev.filter(s => s.id !== serverId));
      notifications.general.success('Сервер удален');
    } catch (error) {
      console.error('Ошибка удаления сервера:', error);
      notifications.general.loadingError();
    }
  };

  const handleTogglePlanStatus = async (planId: string) => {
    try {
      const updatedPlan = await togglePlanStatus(planId);
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      notifications.general.success('Статус плана изменен');
    } catch (error) {
      console.error('Ошибка изменения статуса плана:', error);
      notifications.general.loadingError();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот план? Это действие нельзя отменить.')) return;
    
    try {
      await deleteSubscriptionPlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      notifications.general.success('План удален');
    } catch (error) {
      console.error('Ошибка удаления плана:', error);
      notifications.general.loadingError();
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

  // Пагинация серверов
  const filteredServers = getFilteredAndSortedServers();
  const totalServerPages = Math.ceil(filteredServers.length / serversPerPage);
  const startServerIndex = (currentServerPage - 1) * serversPerPage;
  const currentServers = filteredServers.slice(startServerIndex, startServerIndex + serversPerPage);

  // Пагинация планов
  const filteredPlans = getFilteredAndSortedPlans();
  const totalPlanPages = Math.ceil(filteredPlans.length / plansPerPage);
  const startPlanIndex = (currentPlanPage - 1) * plansPerPage;
  const currentPlans = filteredPlans.slice(startPlanIndex, startPlanIndex + plansPerPage);

  // Пагинация подписчиков
  const filteredSubscribers = getFilteredAndSortedSubscribers();
  const totalSubscriberPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const startSubscriberIndex = (currentSubscriberPage - 1) * subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(startSubscriberIndex, startSubscriberIndex + subscribersPerPage);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Панель продавца
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Управляйте серверами и отслеживайте продажи
          </p>
        </div>

        {/* Табы - адаптивные */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide">
              <div className="flex min-w-full sm:min-w-0">
                {[
                  { id: 'overview', name: 'Обзор', icon: BarChart3 },
                  { id: 'servers', name: 'Серверы', icon: Server },
                  { id: 'plans', name: 'Планы', icon: DollarSign },
                  { id: 'subscribers', name: 'Подписчики', icon: Users },
                  { id: 'analytics', name: 'Аналитика', icon: TrendingUp }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setCurrentServerPage(1);
                      setCurrentPlanPage(1);
                      setCurrentSubscriberPage(1);
                    }}
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

          {/* Содержимое табов */}
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Загрузка данных...</span>
              </div>
            ) : (
              <>
                {/* Обзор */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Статистика - адаптивная сетка */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-4">
                            <Server className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-blue-600">Серверы</p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-900">{stats?.totalServers || 0}</p>
                            <p className="text-xs text-blue-700 hidden sm:block">{stats?.activeServers || 0} активных</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl sm:rounded-2xl p-3 sm:p-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-4">
                            <Users className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-green-600">Подписчики</p>
                            <p className="text-lg sm:text-2xl font-bold text-green-900">{stats?.totalSubscribers || 0}</p>
                            <p className="text-xs text-green-700 hidden sm:block">{stats?.activeSubscribers || 0} активных</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-4">
                            <DollarSign className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-purple-600">Месячный доход</p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-900">${stats?.monthlyRevenue || 0}</p>
                            <p className="text-xs text-purple-700 hidden sm:block">+{stats?.conversionRate || 0}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-4">
                            <DollarSign className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-orange-600">Планы</p>
                            <p className="text-lg sm:text-2xl font-bold text-orange-900">{plans?.length || 0}</p>
                            <p className="text-xs text-orange-700 hidden sm:block">{plans?.filter(p => p.isActive).length || 0} активных</p>
                          </div>
                        </div>
                      </div>
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
                          onClick={() => setActiveTab('plans')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 justify-center"
                        >
                          <DollarSign className="w-4 h-4" />
                          Управление планами
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 justify-center"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Посмотреть аналитику
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Серверы */}
                {activeTab === 'servers' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Фильтры и сортировка - адаптивные */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <select
                          value={serverFilter}
                          onChange={(e) => {
                            setServerFilter(e.target.value as typeof serverFilter);
                            setCurrentServerPage(1);
                          }}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">Все статусы</option>
                          <option value="active">Активные</option>
                          <option value="inactive">Неактивные</option>
                        </select>

                        <select
                          value={serverSortBy}
                          onChange={(e) => setServerSortBy(e.target.value as typeof serverSortBy)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {currentServers.map((server) => (
                        <div key={server.id} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center">
                              <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{server.flag}</span>
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">{server.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">{server.city}, {server.country}</p>
                              </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${server.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          </div>

                          <div className="space-y-2 sm:space-y-3 mb-4">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">План:</span>
                              <span className={`font-medium px-2 py-1 rounded text-xs ${
                                server.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                server.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {server.plan === 'enterprise' ? 'Enterprise' : server.plan === 'premium' ? 'Premium' : 'Basic'}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Подключения:</span>
                              <span className="text-gray-900 font-medium">{server.currentConnections}/{server.maxConnections}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Месячный доход:</span>
                              <span className="text-green-600 font-bold">${server.monthlyRevenue}</span>
                            </div>
                            <div className="hidden sm:flex justify-between text-sm">
                              <span className="text-gray-600">Uptime:</span>
                              <span className="text-gray-900 font-medium">{server.uptime}%</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleToggleServerStatus(server.id)}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                server.isActive
                                  ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                  : 'bg-green-100 hover:bg-green-200 text-green-800'
                              }`}
                            >
                              {server.isActive ? 'Деактивировать' : 'Активировать'}
                            </button>
                            <button
                              onClick={() => handleDeleteServer(server.id)}
                              className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Пагинация серверов */}
                    {totalServerPages > 1 && (
                      <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-2 sm:space-x-3">
                        <button
                          onClick={() => setCurrentServerPage(Math.max(1, currentServerPage - 1))}
                          disabled={currentServerPage === 1}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentServerPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Назад</span>
                        </button>
                        
                        <div className="flex space-x-1 sm:space-x-2">
                          {Array.from({ length: totalServerPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentServerPage(page)}
                              className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                                currentServerPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentServerPage(Math.min(totalServerPages, currentServerPage + 1))}
                          disabled={currentServerPage === totalServerPages}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentServerPage === totalServerPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <span className="hidden sm:inline">Вперед</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Планы */}
                {activeTab === 'plans' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Фильтры и сортировка - адаптивные */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <select
                          value={planFilter}
                          onChange={(e) => {
                            setPlanFilter(e.target.value as typeof planFilter);
                            setCurrentPlanPage(1);
                          }}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">Все статусы</option>
                          <option value="active">Активные</option>
                          <option value="inactive">Неактивные</option>
                        </select>

                        <select
                          value={planSortBy}
                          onChange={(e) => setPlanSortBy(e.target.value as typeof planSortBy)}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="revenue">По доходу</option>
                          <option value="name">По названию</option>
                          <option value="server">По серверу</option>
                          <option value="type">По типу</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setShowCreatePlanModal(true)}
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
                        <div key={plan.id} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
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
                              onClick={() => handleTogglePlanStatus(plan.id)}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                plan.isActive
                                  ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                  : 'bg-green-100 hover:bg-green-200 text-green-800'
                              }`}
                            >
                              {plan.isActive ? 'Деактивировать' : 'Активировать'}
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Пагинация планов */}
                    {totalPlanPages > 1 && (
                      <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-2 sm:space-x-3">
                        <button
                          onClick={() => setCurrentPlanPage(Math.max(1, currentPlanPage - 1))}
                          disabled={currentPlanPage === 1}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentPlanPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Назад</span>
                        </button>
                        
                        <div className="flex space-x-1 sm:space-x-2">
                          {Array.from({ length: totalPlanPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPlanPage(page)}
                              className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                                currentPlanPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPlanPage(Math.min(totalPlanPages, currentPlanPage + 1))}
                          disabled={currentPlanPage === totalPlanPages}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentPlanPage === totalPlanPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <span className="hidden sm:inline">Вперед</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Подписчики */}
                {activeTab === 'subscribers' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Фильтры и сортировка */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                      <select
                        value={subscriberFilter}
                        onChange={(e) => {
                          setSubscriberFilter(e.target.value as typeof subscriberFilter);
                          setCurrentSubscriberPage(1);
                        }}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Все статусы</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                      </select>

                      <select
                        value={subscriberSortBy}
                        onChange={(e) => setSubscriberSortBy(e.target.value as typeof subscriberSortBy)}
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
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
                    {totalSubscriberPages > 1 && (
                      <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-2 sm:space-x-3">
                        <button
                          onClick={() => setCurrentSubscriberPage(Math.max(1, currentSubscriberPage - 1))}
                          disabled={currentSubscriberPage === 1}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentSubscriberPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Назад</span>
                        </button>
                        
                        <div className="flex space-x-1 sm:space-x-2">
                          {Array.from({ length: totalSubscriberPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentSubscriberPage(page)}
                              className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                                currentSubscriberPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentSubscriberPage(Math.min(totalSubscriberPages, currentSubscriberPage + 1))}
                          disabled={currentSubscriberPage === totalSubscriberPages}
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
                            currentSubscriberPage === totalSubscriberPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <span className="hidden sm:inline">Вперед</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Аналитика */}
                {activeTab === 'analytics' && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mt-20">
        <Footer />
      </div>

      {/* Модальное окно создания плана */}
      {showCreatePlanModal && (
        <CreatePlanModal
          servers={servers}
          onClose={() => setShowCreatePlanModal(false)}
          onSuccess={(newPlan) => {
            setPlans(prev => [...prev, newPlan]);
            setShowCreatePlanModal(false);
            notifications.general.success('План успешно создан');
          }}
        />
      )}
    </div>
  );
};

// Компонент модального окна для создания плана
interface CreatePlanModalProps {
  servers: SellerServer[];
  onClose: () => void;
  onSuccess: (plan: SubscriptionPlan) => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ servers, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionPlanForm>({
    name: '',
    type: 'basic',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxConnections: 1,
    bandwidthLimit: '',
    speedLimit: '',
    isPopular: false,
    sortOrder: 0,
    features: [],
    description: ''
  });
  const [selectedServerId, setSelectedServerId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServerId) {
      notifications.general.loadingError();
      return;
    }

    setIsSubmitting(true);
    try {
      const newPlan = await createSubscriptionPlan(selectedServerId, formData);
      onSuccess(newPlan);
    } catch (error) {
      console.error('Ошибка создания плана:', error);
      notifications.general.loadingError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const availableFeatures = [
    'Безлимитный трафик',
    'Netflix поддержка',
    'Торрент разрешён',
    'P2P оптимизация',
    'DDoS защита',
    'Высокая скорость',
    'Без логов',
    '24/7 поддержка'
  ];

  const activeServers = servers.filter(server => server.isActive);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Создать план подписки</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор сервера */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сервер *
              </label>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Выберите сервер</option>
                {activeServers.map(server => (
                  <option key={server.id} value={server.id}>
                    {server.flag} {server.name} ({server.city}, {server.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Название плана */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название плана *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Например: Premium VPN"
              />
            </div>

            {/* Тип плана */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип плана *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Цены */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Месячная цена ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                  required
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Годовая цена ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                  required
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Максимальные подключения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальное количество подключений *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.maxConnections}
                onChange={(e) => setFormData(prev => ({ ...prev, maxConnections: parseInt(e.target.value) || 1 }))}
                required
                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Ограничения */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ограничение пропускной способности
                </label>
                <input
                  type="text"
                  value={formData.bandwidthLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, bandwidthLimit: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Например: 1TB/мес"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ограничение скорости
                </label>
                <input
                  type="text"
                  value={formData.speedLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, speedLimit: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Например: 100 Мбит/с"
                />
              </div>
            </div>

            {/* Особенности */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особенности плана
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание плана
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Краткое описание плана..."
              />
            </div>

            {/* Популярный план */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700">
                Отметить как популярный план
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Создание...' : 'Создать план'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 