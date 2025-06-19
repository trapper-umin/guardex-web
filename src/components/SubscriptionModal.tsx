import React, { useState } from 'react';
import { mockPurchaseSubscription } from '../services/api';
import { notifications } from '../utils/notifications';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Популярные тарифы с описаниями
const subscriptionPlans = [
  { months: 1, label: '1 месяц', description: 'Пробный тариф' },
  { months: 3, label: '3 месяца', description: 'Популярный выбор' },
  { months: 6, label: '6 месяцев', description: 'Выгодно' },
  { months: 12, label: '1 год', description: 'Максимальная выгода' },
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const pricePerMonth = 125;
  const totalPrice = selectedMonths * pricePerMonth;

  // Расчет скидки для длительных тарифов
  const getDiscount = (months: number) => {
    if (months >= 12) return 20; // 20% скидка за год
    if (months >= 6) return 10;  // 10% скидка за полгода
    if (months >= 3) return 5;   // 5% скидка за квартал
    return 0;
  };

  const discount = getDiscount(selectedMonths);
  const discountAmount = Math.round((totalPrice * discount) / 100);
  const finalPrice = totalPrice - discountAmount;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      await mockPurchaseSubscription(selectedMonths);
      
      notifications.subscription.paymentSuccess();
      onSuccess();
      onClose();
      
      // Сбрасываем состояние для следующего открытия модалки
      setSelectedMonths(1);
    } catch (error) {
      console.error('Ошибка при покупке:', error);
      notifications.subscription.paymentError('Произошла ошибка при оплате. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedMonths(1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Продлить подписку
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Информационное сообщение */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            ℹ️ Выбранное время будет добавлено к вашей текущей подписке
          </p>
        </div>

        <div className="mb-6">
          {/* Кнопки выбора тарифа */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {subscriptionPlans.map((plan) => (
              <button
                key={plan.months}
                onClick={() => setSelectedMonths(plan.months)}
                disabled={isProcessing}
                className={`p-4 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                  selectedMonths === plan.months
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium">{plan.label}</div>
                <div className="text-xs text-gray-500 mt-1">{plan.description}</div>
                {getDiscount(plan.months) > 0 && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    -{getDiscount(plan.months)}% скидка
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Информация о цене */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Цена за месяц:</span>
              <span className="font-medium">{pricePerMonth} ₽</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Количество месяцев:</span>
              <span className="font-medium">{selectedMonths}</span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Сумма без скидки:</span>
                  <span className="line-through text-gray-500">{totalPrice} ₽</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600">Скидка ({discount}%):</span>
                  <span className="text-green-600 font-medium">-{discountAmount} ₽</span>
                </div>
              </>
            )}
            <hr className="my-2 border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Итого:</span>
              <span className="text-lg font-bold text-blue-600">{finalPrice} ₽</span>
            </div>
          </div>

          {/* Информация о выгоде */}
          {selectedMonths >= 6 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm">
                🎉 {selectedMonths >= 12 ? 'Максимальная выгода!' : 'Выгодный тариф!'} 
                {discount > 0 && ` Вы экономите ${discountAmount} ₽`}
              </p>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Обработка...
              </>
            ) : (
              `Оплатить ${finalPrice} ₽`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 