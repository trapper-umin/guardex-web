import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { Footer } from '../components';
import { notifications } from '../utils/notifications';
import {
  getSellerStats,
  getSellerServers,
  getSellerSubscribers,
  getSalesData,
  toggleServerStatus,
  deleteServer
} from '../services/api';
import type { SellerServer, SellerStats, SellerSubscriber, SalesData } from '../utils/types';

const SellerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Основные состояния
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [servers, setServers] = useState<SellerServer[]>([]);
  const [subscribers, setSubscribers] = useState<SellerSubscriber[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'subscribers' | 'analytics'>('overview');

  // Состояния для серверов
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const [serverFilter, setServerFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [serverSortBy, setServerSortBy] = useState<'name' | 'country' | 'plan' | 'revenue'>('revenue');
  const [currentServerPage, setCurrentServerPage] = useState(1);
  const [serversPerPage] = useState(6);

  // Состояния для подписчиков  
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriberSortBy, setSubscriberSortBy] = useState<'email' | 'server' | 'date' | 'paid'>('date');
  const [currentSubscriberPage, setCurrentSubscriberPage] = useState(1);
  const [subscribersPerPage] = useState(8);

  // Состояние для тултипов графика
  const [hoveredDay, setHoveredDay] = useState<SalesData | null>(null);

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
      const [statsData, serversData, subscribersData, salesDataResult] = await Promise.all([
        getSellerStats(),
        getSellerServers(),
        getSellerSubscribers(),
        getSalesData(14) // Загружаем данные за 14 дней
      ]);
      
      setStats(statsData);
      setServers(serversData);
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
          return a.plan.localeCompare(b.plan);
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
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', name: 'Обзор', icon: '📊' },
                { id: 'servers', name: 'Серверы', icon: '🖥️' },
                { id: 'subscribers', name: 'Подписчики', icon: '👥' },
                { id: 'analytics', name: 'Аналитика', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setCurrentServerPage(1);
                    setCurrentSubscriberPage(1);
                  }}
                  className={`relative min-w-0 flex-1 sm:flex-none sm:px-8 px-4 py-3 sm:py-4 text-center border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors duration-200`}
                >
                  <span className="inline sm:hidden text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.icon} {tab.name}</span>
                  <span className="sm:hidden block text-xs mt-1">{tab.name}</span>
                </button>
              ))}
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
                            <span className="text-white text-sm sm:text-xl">🖥️</span>
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
                            <span className="text-white text-sm sm:text-xl">👥</span>
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
                            <span className="text-white text-sm sm:text-xl">💰</span>
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
                            <span className="text-white text-sm sm:text-xl">⭐</span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-orange-600">Рейтинг</p>
                            <p className="text-lg sm:text-2xl font-bold text-orange-900">{stats?.averageRating || 0}</p>
                            <p className="text-xs text-orange-700 hidden sm:block">{stats?.totalReviews || 0} отзывов</p>
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
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                        >
                          ➕ Добавить сервер
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                        >
                          📊 Посмотреть аналитику
                        </button>
                        <button
                          onClick={() => setActiveTab('subscribers')}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                        >
                          👥 Управление подписчиками
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
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                      >
                        ➕ Добавить сервер
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
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                            currentServerPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <span className="hidden sm:inline">← </span>Назад
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
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                            currentServerPage === totalServerPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          Вперед<span className="hidden sm:inline"> →</span>
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
                                <span className="text-gray-900">{subscriber.plan === 'monthly' ? 'Месячный' : 'Годовой'}</span>
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
                                    {subscriber.plan === 'monthly' ? 'Месячный' : 'Годовой'}
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
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                            currentSubscriberPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <span className="hidden sm:inline">← </span>Назад
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
                          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                            currentSubscriberPage === totalSubscriberPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          Вперед<span className="hidden sm:inline"> →</span>
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
                        <div className="absolute bottom-8 left-0 right-0 flex items-end justify-between space-x-1 sm:space-x-2 overflow-x-auto" style={{ height: '240px' }}>
                          {salesData.length > 0 ? (
                            salesData.map((day, index) => {
                              const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1); // Минимум 1 чтобы избежать деления на 0
                              const heightPx = Math.max((day.revenue / maxRevenue) * 200, 8); // Высота в пикселях от 8px до 200px
                              
                              return (
                                <div
                                  key={day.date}
                                  className="relative flex-1 flex flex-col items-center cursor-pointer"
                                  onMouseEnter={() => setHoveredDay(day)}
                                  onMouseLeave={() => setHoveredDay(null)}
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
                                <div className="text-4xl mb-2">📊</div>
                                <p>Нет данных для отображения</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Тултип при наведении */}
                      {hoveredDay && (
                        <div className="absolute top-4 left-4 bg-gray-900 text-white p-3 rounded-lg shadow-xl z-20 pointer-events-none">
                          <div className="text-sm font-medium">
                            {new Date(hoveredDay.date).toLocaleDateString('ru-RU', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs mt-1 space-y-1">
                            <div>💰 Доход: <span className="font-bold text-green-400">${hoveredDay.revenue}</span></div>
                            <div>👥 Подписчики: <span className="font-bold text-blue-400">{hoveredDay.subscribers}</span></div>
                            <div>↩️ Возвраты: <span className="font-bold text-red-400">{hoveredDay.refunds}</span></div>
                          </div>
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
    </div>
  );
};

export default SellerDashboard; 