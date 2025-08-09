import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { 
  getSubscriptionStatus, 
  getVpnConfigForSubscription, 
  regenerateVpnConfigForSubscription,
  extendSubscription
} from '../services/api';
import type { VpnSubscription } from '../utils/types';
import { SubscriptionModal, Footer, BecomeSellerModal } from '../components';
// import { buttonStyles, cardStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';
import { AlertTriangle, RotateCw, Search, Lock, Shield, Star, Server, Download, HelpCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для данных и лоадеров
  // const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [subscriptions, setSubscriptions] = useState<VpnSubscription[]>([]);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [downloadingConfigs, setDownloadingConfigs] = useState<Set<string>>(new Set());
  const [regeneratingKeys, setRegeneratingKeys] = useState<Set<string>>(new Set());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  // const [selectedSubscriptionForExtension, setSelectedSubscriptionForExtension] = useState<string | null>(null);
  const [isBecomeSellerModalOpen, setIsBecomeSellerModalOpen] = useState(false);
  
  // Состояния для фильтров
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expires' | 'country'>('expires');
  
  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // Загружаем данные о подписке при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptionData();
    }
  }, [isAuthenticated]);

  // Функция загрузки данных о подписке
  const loadSubscriptionData = async () => {
    try {
      setIsLoadingSubscription(true);
      const subscriptionStatus = await getSubscriptionStatus();
      // setSubscription(subscriptionStatus);
      setSubscriptions(subscriptionStatus.subscriptions || []);
    } catch (error) {
      console.error('Ошибка загрузки данных подписки:', error);
      notifications.general.loadingError();
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Функция фильтрации и сортировки подписок
  const getFilteredAndSortedSubscriptions = () => {
    let filtered = [...subscriptions];

    // Фильтрация по статусу
    if (statusFilter === 'active') {
      filtered = filtered.filter(sub => sub.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(sub => !sub.isActive);
    }

    // Фильтрация по плану
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan === planFilter);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'expires':
          aValue = new Date(a.expiresAt).getTime();
          bValue = new Date(b.expiresAt).getTime();
          break;
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return filtered;
  };

  // Функция для скачивания VPN конфигурации конкретной подписки
  const handleDownloadConfig = async (subscriptionId: string, subscriptionName: string) => {
    try {
      setDownloadingConfigs(prev => new Set(prev).add(subscriptionId));
      const configBlob = await getVpnConfigForSubscription(subscriptionId);
      
      // Создаем URL для скачивания файла
      const url = URL.createObjectURL(configBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vpn-config-${subscriptionName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.conf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      URL.revokeObjectURL(url);
      
      notifications.vpn.configDownloaded();
    } catch (error) {
      console.error('Ошибка скачивания конфигурации:', error);
      notifications.vpn.configError();
    } finally {
      setDownloadingConfigs(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
    }
  };

  // Функция для перегенерации ключа конкретной подписки
  const handleRegenerateKey = async (subscriptionId: string) => {
    try {
      setRegeneratingKeys(prev => new Set(prev).add(subscriptionId));
      await regenerateVpnConfigForSubscription(subscriptionId);
      notifications.vpn.keyRegenerated();
    } catch (error) {
      console.error('Ошибка перегенерации ключа:', error);
      notifications.vpn.keyRegenerationError();
    } finally {
      setRegeneratingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
    }
  };

  // Функция для продления конкретной подписки
  const handleExtendSubscription = async (subscriptionId: string, months: number = 1) => {
    try {
      await extendSubscription(subscriptionId, months);
      // Перезагружаем данные о подписках
      await loadSubscriptionData();
      notifications.subscription.paymentSuccess();
    } catch (error) {
      console.error('Ошибка продления подписки:', error);
      notifications.general.loadingError();
    }
  };

  // Обработчик успешной покупки подписки
  const handleSubscriptionSuccess = () => {
    // Перезагружаем данные о подписке
    loadSubscriptionData();
    notifications.subscription.paymentSuccess();
  };

  // Обработчик успешного получения роли продавца
  const handleBecomeSellerSuccess = () => {
    setIsBecomeSellerModalOpen(false);
    notifications.subscription.paymentSuccess();
  };

  // Если пользователь не авторизован, не показываем содержимое
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Личный кабинет
          </h1>
          <p className="text-gray-600">
            Управляйте подписками и настройками VPN
          </p>
        </div>

        {/* Статистика пользователя */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Активные подписки</p>
                <p className={`text-lg font-bold ${subscriptions.filter(sub => sub.isActive).length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoadingSubscription ? 'Загрузка...' : subscriptions.filter(sub => sub.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Мин. до истечения</p>
                <p className={`text-lg font-bold ${(() => {
                  const activeSubs = subscriptions.filter(sub => sub.isActive);
                  if (activeSubs.length === 0) return 'text-gray-900';
                  const minDays = Math.min(...activeSubs.map(sub => sub.daysLeft));
                  return minDays <= 3 ? 'text-red-600' : 'text-gray-900';
                })()}`}>
                  {isLoadingSubscription ? '...' : (() => {
                    const activeSubs = subscriptions.filter(sub => sub.isActive);
                    return activeSubs.length > 0 ? Math.min(...activeSubs.map(sub => sub.daysLeft)) + ' дней' : '0 дней';
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Страны</p>
                <p className="text-lg font-bold text-gray-900">
                  {isLoadingSubscription ? '...' : (() => {
                    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
                    const uniqueCountries = new Set(activeSubscriptions.map(sub => sub.country));
                    return uniqueCountries.size > 0 ? `${uniqueCountries.size} стран` : '0 стран';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Основные секции */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
          {/* Мои подписки */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8 hover:shadow-2xl transition-shadow duration-300 flex flex-col lg:min-h-[700px]">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Мои подписки</h2>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Управление VPN-ключами</p>
              </div>
            </div>

            {isLoadingSubscription ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Загрузка подписок...</span>
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Фильтры */}
                <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Фильтр по статусу */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Все статусы</option>
                      <option value="active">Активные</option>
                      <option value="inactive">Неактивные</option>
                    </select>

                    {/* Фильтр по плану */}
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
                      className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Все планы</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Сортировка */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="expires">По дате истечения</option>
                      <option value="name">По названию</option>
                      <option value="country">По стране</option>
                    </select>
                  </div>
                </div>

                {/* Контейнер для прокрутки подписок */}
                <div 
                  className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D1D5DB #F3F4F6',
                    maxHeight: '500px' // Фиксированная высота для симметрии
                  }}
                >
                  {getFilteredAndSortedSubscriptions().length > 0 ? (
                    getFilteredAndSortedSubscriptions().map((sub) => (
                      <div key={sub.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">{sub.flag}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center">
                                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 flex-shrink-0 ${sub.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{sub.name}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate">{sub.server}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                            <span className={`hidden sm:inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                              sub.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              sub.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sub.plan === 'enterprise' ? 'Enterprise' : sub.plan === 'premium' ? 'Premium' : 'Basic'}
                            </span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${sub.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {sub.isActive ? 'Активна' : 'Неактивна'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div className="text-center">
                            <div className="text-xs sm:text-sm text-gray-600">Истекает</div>
                            <div className="font-semibold text-gray-900 text-xs sm:text-base">
                              {new Date(sub.expiresAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs sm:text-sm text-gray-600">Осталось</div>
                            <div className={`font-semibold text-xs sm:text-base ${sub.daysLeft <= 7 && sub.isActive ? 'text-red-600' : 'text-gray-900'}`}>
                              {sub.daysLeft} дней
                            </div>
                          </div>
                          <div className="text-center hidden sm:block">
                            <div className="text-sm text-gray-600">Скорость</div>
                            <div className="font-semibold text-gray-900">{sub.speed}</div>
                          </div>
                          <div className="text-center hidden sm:block">
                            <div className="text-sm text-gray-600">Пинг</div>
                            <div className="font-semibold text-gray-900">{sub.ping}ms</div>
                          </div>
                        </div>
                        
                        {sub.daysLeft <= 7 && sub.isActive && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 mb-3">
                            <div className="flex items-center">
                              <div className="text-yellow-500 text-base sm:text-lg mr-2 flex-shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <p className="text-xs sm:text-sm text-yellow-800">
                                <span className="hidden sm:inline">Подписка заканчивается через {sub.daysLeft} {sub.daysLeft === 1 ? 'день' : 'дня'}</span>
                                <span className="sm:hidden">Истекает через {sub.daysLeft}д</span>
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleDownloadConfig(sub.id, sub.name)}
                            disabled={downloadingConfigs.has(sub.id) || !sub.isActive}
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              sub.isActive 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!sub.isActive ? 'Необходима активная подписка' : ''}
                          >
                            {downloadingConfigs.has(sub.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                                <span className="hidden sm:inline">Загрузка...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Скачать</span>
                                <span className="sm:hidden">Ключ</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleRegenerateKey(sub.id)}
                            disabled={regeneratingKeys.has(sub.id) || !sub.isActive}
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              sub.isActive 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow hover:shadow-md' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!sub.isActive ? 'Необходима активная подписка' : ''}
                          >
                            {regeneratingKeys.has(sub.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                                <span className="hidden sm:inline">Обновление...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Обновить</span>
                                <span className="sm:hidden">
                                  <RotateCw className="w-4 h-4" />
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleExtendSubscription(sub.id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-3 rounded-lg shadow hover:shadow-md transition-all duration-200 text-sm"
                          >
                            Продлить
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 text-sm">Нет подписок, соответствующих выбранным фильтрам</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-gray-400 mb-3 sm:mb-4">
                  <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </div>
                <p className="text-gray-600 text-sm sm:text-base">У вас пока нет активных подписок</p>
              </div>
            )}
          </div>

          {/* Маркетплейс и продажи */}
          <div className="space-y-6 flex flex-col h-full lg:min-h-[700px]">
            {/* Маркетплейс VPN */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300 flex-1">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Маркетплейс VPN</h2>
                  <p className="text-gray-600">Выберите лучший VPN</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1000+</div>
                    <div className="text-sm text-gray-600">VPN серверов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">50+</div>
                    <div className="text-sm text-gray-600">стран</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 text-center">
                  Найдите идеальный VPN по стране, скорости и цене
                </p>
              </div>

              <button
                onClick={() => navigate(ROUTES.MARKETPLACE)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">
                  Перейти в маркетплейс
                </span>
              </button>
            </div>

            {/* Стать продавцом / Панель продавца */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300 flex-1">
              <div className="flex items-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-lg ${
                  user?.role === 'SELLER' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}>
                  {user?.role === 'SELLER' ? (
                    <Star className="w-7 h-7 text-white" />
                  ) : (
                    <HelpCircle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.role === 'SELLER' ? 'Панель продавца' : 'Стать продавцом'}
                  </h2>
                  <p className="text-gray-600">
                    {user?.role === 'SELLER' ? 'Управляйте VPN серверами' : 'Зарабатывайте на VPN'}
                  </p>
                </div>
              </div>

              {user?.role === 'SELLER' ? (
                // Для продавца показываем статистику
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Активно</div>
                      <div className="text-sm text-gray-600">Статус продавца</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">Готово</div>
                      <div className="text-sm text-gray-600">К работе</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 text-center">
                    Вы можете создавать и управлять VPN серверами
                  </p>
                </div>
              ) : (
                // Для обычного пользователя показываем возможный доход
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl font-bold text-green-600">$5,000</div>
                    <div className="text-sm text-gray-600 ml-2">/месяц</div>
                  </div>
                  <p className="text-sm text-gray-700 text-center">
                    Средний доход успешного продавца VPN
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (user?.role === 'SELLER') {
                    navigate(ROUTES.SELLER_DASHBOARD);
                  } else {
                    setIsBecomeSellerModalOpen(true);
                  }
                }}
                className={`w-full font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group ${
                  user?.role === 'SELLER' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } text-white`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">
                  {user?.role === 'SELLER' ? 'Перейти в панель' : 'Стать продавцом'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>

      {/* Модальное окно подписки */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Модальное окно получения роли продавца */}
      <BecomeSellerModal
        isOpen={isBecomeSellerModalOpen}
        onClose={() => setIsBecomeSellerModalOpen(false)}
        onSuccess={handleBecomeSellerSuccess}
      />
    </div>
  );
};

export default Dashboard; 