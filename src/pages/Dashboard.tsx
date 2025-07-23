import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { getSubscriptionStatus, getVpnConfig, regenerateVpnConfig, type SubscriptionStatus } from '../services/api';
import { SubscriptionModal, Footer } from '../components';
import { buttonStyles, cardStyles } from '../utils/styles';
import { notifications } from '../utils/notifications';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для данных и лоадеров
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isDownloadingConfig, setIsDownloadingConfig] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
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
      const data = await getSubscriptionStatus();
      setSubscription(data);
    } catch (error) {
      console.error('Ошибка загрузки данных подписки:', error);
      notifications.general.loadingError();
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Функция для скачивания VPN конфигурации
  const handleDownloadConfig = async () => {
    try {
      setIsDownloadingConfig(true);
      const configBlob = await getVpnConfig();
      
      // Создаем URL для скачивания файла
      const url = URL.createObjectURL(configBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vpn-config-${Date.now()}.conf`;
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
      setIsDownloadingConfig(false);
    }
  };

  // Функция для перегенерации ключа
  const handleRegenerateKey = async () => {
    try {
      setIsRegeneratingKey(true);
      await regenerateVpnConfig();
      notifications.vpn.keyRegenerated();
    } catch (error) {
      console.error('Ошибка перегенерации ключа:', error);
      notifications.vpn.keyRegenerationError();
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  // Обработчик успешной покупки подписки
  const handleSubscriptionSuccess = () => {
    // Перезагружаем данные о подписке
    loadSubscriptionData();
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
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Статус подписки</p>
                <p className={`text-lg font-bold ${subscription?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoadingSubscription ? 'Загрузка...' : subscription?.isActive ? 'Активна' : 'Неактивна'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Осталось дней</p>
                <p className={`text-lg font-bold ${subscription && subscription.daysLeft <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {isLoadingSubscription ? '...' : subscription?.daysLeft || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.14 0-2 .86-2 2v2c0 1.14.86 2 2 2h14c1.14 0 2-.86 2-2V5c0-1.14-.86-2-2-2h-2z M17 16c0 1.14-.86 2-2 2H5c-1.14 0-2-.86-2-2v-2c0-1.14.86-2 2-2h10c1.14 0 2 .86 2 2v2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Серверы VPN</p>
                <p className="text-lg font-bold text-gray-900">
                  {subscription?.isActive ? '1 активен' : 'Нет активных'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Основные секции */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Мои подписки */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Мои подписки</h2>
                <p className="text-gray-600">Управление VPN-ключами</p>
              </div>
            </div>

            {isLoadingSubscription ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Загрузка подписок...</span>
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${subscription.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="font-semibold text-gray-900">Premium VPN</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {subscription.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Истекает: {new Date(subscription.expiresAt).toLocaleDateString('ru-RU')}</p>
                    <p>Осталось: {subscription.daysLeft} дней</p>
                  </div>
                  
                  {subscription.daysLeft <= 7 && subscription.isActive && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center">
                        <div className="text-yellow-500 text-lg mr-2">⚠️</div>
                        <p className="text-sm text-yellow-800">
                          Подписка заканчивается через {subscription.daysLeft} {subscription.daysLeft === 1 ? 'день' : 'дня'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownloadConfig}
                      disabled={isDownloadingConfig || !subscription?.isActive}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        subscription?.isActive 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={!subscription?.isActive ? 'Необходима активная подписка' : ''}
                    >
                      {isDownloadingConfig ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Скачивание...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          Скачать ключ
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRegenerateKey}
                      disabled={isRegeneratingKey || !subscription?.isActive}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        subscription?.isActive 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={!subscription?.isActive ? 'Необходима активная подписка' : ''}
                    >
                      {isRegeneratingKey ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Обновление...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,6V9L16,5L12,1V4A8,8 0 0,0 4,12C4,13.57 4.46,15.03 5.24,16.26L6.7,14.8C6.25,13.97 6,13 6,12A6,6 0 0,1 12,6M18.76,7.74L17.3,9.2C17.74,10.04 18,11 18,12A6,6 0 0,1 12,18V15L8,19L12,23V20A8,8 0 0,0 20,12C20,10.43 19.54,8.97 18.76,7.74Z"/>
                          </svg>
                          Обновить ключ
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Продлить подписку
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <p className="text-gray-600 mb-4">У вас пока нет активных подписок</p>
                <button 
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Купить подписку
                </button>
              </div>
            )}
          </div>

          {/* Маркетплейс и продажи */}
          <div className="space-y-6">
            {/* Маркетплейс VPN */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
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
                onClick={() => navigate('/marketplace')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">
                  Перейти в маркетплейс
                </span>
              </button>
            </div>

            {/* Стать продавцом */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Стать продавцом</h2>
                  <p className="text-gray-600">Зарабатывайте на VPN</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-4xl font-bold text-green-600">$5,000</div>
                  <div className="text-sm text-gray-600 ml-2">/месяц</div>
                </div>
                <p className="text-sm text-gray-700 text-center">
                  Средний доход успешного продавца VPN
                </p>
              </div>

              <button
                onClick={() => navigate('/seller')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">
                  Начать продавать
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
    </div>
  );
};

export default Dashboard; 