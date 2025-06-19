import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { getSubscriptionStatus, getVpnConfig, regenerateVpnConfig, type SubscriptionStatus } from '../services/api';
import { SubscriptionModal, PageWrapper } from '../components';
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
    <PageWrapper>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
        Личный кабинет
      </h1>
      
      {/* Блок с информацией о подписке */}
      <div className={`${cardStyles.base} mb-4 sm:mb-6`}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Информация о подписке
        </h2>
        
        {isLoadingSubscription ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm sm:text-base text-gray-600">Загрузка подписки...</span>
          </div>
        ) : subscription ? (
          <>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Статус:</span>
                <span className={`font-semibold text-sm sm:text-base ${subscription.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {subscription.isActive ? '✅ Активен' : '❌ Неактивен'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Осталось дней:</span>
                <span className={`font-semibold text-sm sm:text-base ${subscription.daysLeft <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {subscription.daysLeft}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Дата окончания:</span>
                <span className="font-semibold text-sm sm:text-base text-gray-900">
                  {new Date(subscription.expiresAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Email:</span>
                <span className="font-semibold text-sm sm:text-base text-gray-900 break-all">{user?.email}</span>
              </div>
            </div>
            
            {/* Предупреждение о скором окончании */}
            {subscription.daysLeft <= 7 && subscription.isActive && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-yellow-400 text-xl mr-3">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Подписка заканчивается через {subscription.daysLeft} {subscription.daysLeft === 1 ? 'день' : 'дня'}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Рекомендуем продлить подписку заранее, чтобы не потерять доступ к VPN
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Кнопка продления подписки */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className={`w-full ${buttonStyles.success}`}
              >
                Продлить подписку
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-sm sm:text-base text-gray-600">
            <div className="text-red-500 text-4xl mb-3">❌</div>
            <p>Не удалось загрузить данные о подписке</p>
            <button 
              onClick={loadSubscriptionData}
              className={`mt-3 ${buttonStyles.primary} text-sm px-4 py-2`}
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>

      {/* Блок с действиями */}
      <div className={cardStyles.base}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Управление VPN
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleDownloadConfig}
            disabled={isDownloadingConfig || !subscription?.isActive}
            className={`flex-1 ${buttonStyles.primary} ${(isDownloadingConfig || !subscription?.isActive) ? 'cursor-not-allowed' : ''}`}
            title={!subscription?.isActive ? 'Необходима активная подписка' : ''}
          >
            {isDownloadingConfig ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Скачивание...
              </>
            ) : (
              <>
                📁 Скачать ключ VPN
              </>
            )}
          </button>
          <button
            onClick={handleRegenerateKey}
            disabled={isRegeneratingKey || !subscription?.isActive}
            className={`flex-1 ${buttonStyles.secondary} ${(isRegeneratingKey || !subscription?.isActive) ? 'cursor-not-allowed' : ''}`}
            title={!subscription?.isActive ? 'Необходима активная подписка' : ''}
          >
            {isRegeneratingKey ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Перегенерация...
              </>
            ) : (
              <>
                🔄 Перегенерировать ключ
              </>
            )}
          </button>
        </div>
        
        {!subscription?.isActive && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Для использования VPN необходима активная подписка. Приобретите или продлите подписку выше.
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно подписки */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    </PageWrapper>
  );
};

export default Dashboard; 