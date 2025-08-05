import React from 'react';
import { type PurchaseResponse } from '../utils/types';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseData: PurchaseResponse | null;
}

const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  isOpen,
  onClose,
  purchaseData
}) => {
  if (!isOpen || !purchaseData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{purchaseData.message}</h2>
                <p className="text-green-100 text-sm">ID подписки: {purchaseData.subscriptionId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Информация о плане и сервере */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-3">{purchaseData.server.flag}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{purchaseData.plan.name}</h3>
                  <p className="text-gray-600">{purchaseData.server.name} • {purchaseData.server.city}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                purchaseData.plan.type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                purchaseData.plan.type === 'premium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {purchaseData.plan.type === 'enterprise' ? 'Enterprise' : 
                 purchaseData.plan.type === 'premium' ? 'Premium' : 'Basic'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-gray-600">Максимум подключений</div>
                <div className="text-lg font-bold">{purchaseData.plan.maxConnections}</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-gray-600">Uptime сервера</div>
                <div className="text-lg font-bold">{purchaseData.server.uptime}%</div>
              </div>
              {purchaseData.plan.speedLimit && (
                <div className="bg-white rounded-xl p-4">
                  <div className="text-sm text-gray-600">Ограничение скорости</div>
                  <div className="text-lg font-bold">{purchaseData.plan.speedLimit}</div>
                </div>
              )}
              {purchaseData.server.ping && (
                <div className="bg-white rounded-xl p-4">
                  <div className="text-sm text-gray-600">Пинг</div>
                  <div className="text-lg font-bold">{purchaseData.server.ping}ms</div>
                </div>
              )}
            </div>
          </div>

          {/* Информация о подписке */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📅 Период подписки</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Период оплаты</div>
                <div className="text-lg font-bold capitalize">
                  {purchaseData.subscription.billingCycle === 'monthly' ? 'Месячная' : 'Годовая'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Общая продолжительность</div>
                <div className="text-lg font-bold">{purchaseData.subscription.daysTotal} дней</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Дата начала</div>
                <div className="text-lg font-bold">{formatDate(purchaseData.subscription.startDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Дата окончания</div>
                <div className="text-lg font-bold">{formatDate(purchaseData.subscription.endDate)}</div>
              </div>
            </div>
          </div>

          {/* Информация о платеже */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">💳 Платежная информация</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Сумма к оплате</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(purchaseData.payment.amount, purchaseData.payment.currency)}
                </div>
              </div>
              {purchaseData.payment.savings && purchaseData.payment.savings > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Экономия за год</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    -{formatAmount(purchaseData.payment.savings, purchaseData.payment.currency)}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">Дата оплаты</div>
                <div className="text-lg font-bold">{formatDate(purchaseData.payment.paymentDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email для уведомлений</div>
                <div className="text-lg font-bold">{purchaseData.subscription.userEmail}</div>
              </div>
            </div>
          </div>

          {/* Следующие шаги */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🚀 Что дальше?</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
                <span className="text-gray-700">Перейдите в раздел "Мои подписки" для настройки</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <span className="text-gray-700">Скачайте конфигурационный файл VPN</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <span className="text-gray-700">Настройте VPN-клиент на своих устройствах</span>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                // Здесь можно добавить навигацию к подпискам
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Перейти к подпискам
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;