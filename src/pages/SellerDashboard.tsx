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
  deleteServer,
  getSellerPlans,
  togglePlanStatus,
  deleteSubscriptionPlan,
} from '../services/api';
import {
  SellerTabNavigation,
  SellerOverview,
  SellerServers,
  SellerPlans,
  SellerSubscribers,
  SellerAnalytics,
  CreatePlanModal,
  type SellerTabType
} from '../components/seller';
import type { 
  SellerServer, 
  SellerStats, 
  SellerSubscriber, 
  SalesData, 
  SubscriptionPlan 
} from '../utils/types';

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
  const [activeTab, setActiveTab] = useState<SellerTabType>('overview');

  // Состояния для серверов
  const [serverFilter, setServerFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [serverSortBy, setServerSortBy] = useState<'name' | 'country' | 'plan' | 'revenue'>('revenue');
  const [currentServerPage, setCurrentServerPage] = useState(1);
  const [serversPerPage] = useState(6);

  // Состояния для планов
  const [planFilter, setPlanFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planSortBy, setPlanSortBy] = useState<'name' | 'server' | 'type' | 'revenue'>('revenue');
  const [currentPlanPage, setCurrentPlanPage] = useState(1);
  const [plansPerPage] = useState(6); // 6 планов для сетки 2x3

  // Состояния для подписчиков  
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriberSortBy, setSubscriberSortBy] = useState<'email' | 'server' | 'date' | 'paid'>('date');
  const [currentSubscriberPage, setCurrentSubscriberPage] = useState(1);
  const [subscribersPerPage] = useState(8); // 6 подписчиков для консистентности

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

  const handleTabChange = (tab: SellerTabType) => {
    setActiveTab(tab);
    setCurrentServerPage(1);
    setCurrentPlanPage(1);
    setCurrentSubscriberPage(1);
  };

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

        {/* Основная панель */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <SellerTabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Содержимое табов */}
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Загрузка данных...</span>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <SellerOverview
                    stats={stats}
                    plans={plans}
                    onTabChange={handleTabChange}
                  />
                )}

                {activeTab === 'servers' && (
                  <SellerServers
                    servers={servers}
                    serverFilter={serverFilter}
                    serverSortBy={serverSortBy}
                    currentServerPage={currentServerPage}
                    serversPerPage={serversPerPage}
                    onFilterChange={(filter) => {
                      setServerFilter(filter);
                      setCurrentServerPage(1);
                    }}
                    onSortChange={setServerSortBy}
                    onPageChange={setCurrentServerPage}
                    onToggleServerStatus={handleToggleServerStatus}
                    onDeleteServer={handleDeleteServer}
                  />
                )}

                {activeTab === 'plans' && (
                  <SellerPlans
                    plans={plans}
                    planFilter={planFilter}
                    planSortBy={planSortBy}
                    currentPlanPage={currentPlanPage}
                    plansPerPage={plansPerPage}
                    onFilterChange={(filter) => {
                      setPlanFilter(filter);
                      setCurrentPlanPage(1);
                    }}
                    onSortChange={setPlanSortBy}
                    onPageChange={setCurrentPlanPage}
                    onTogglePlanStatus={handleTogglePlanStatus}
                    onDeletePlan={handleDeletePlan}
                    onCreatePlan={() => setShowCreatePlanModal(true)}
                  />
                )}

                {activeTab === 'subscribers' && (
                  <SellerSubscribers
                    subscribers={subscribers}
                    subscriberFilter={subscriberFilter}
                    subscriberSortBy={subscriberSortBy}
                    currentSubscriberPage={currentSubscriberPage}
                    subscribersPerPage={subscribersPerPage}
                    onFilterChange={(filter) => {
                      setSubscriberFilter(filter);
                      setCurrentSubscriberPage(1);
                    }}
                    onSortChange={setSubscriberSortBy}
                    onPageChange={setCurrentSubscriberPage}
                  />
                )}

                {activeTab === 'analytics' && (
                  <SellerAnalytics salesData={salesData} />
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

export default SellerDashboard;
