import React, { useState } from 'react';
import { becomeSeller, type BecomeSellerRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../utils/notifications';
import type { BecomeSellerForm } from '../utils/types';
import { X, Info } from 'lucide-react';

interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BecomeSellerForm>({
    isSelfEmployed: false,
    businessName: '',
    businessDescription: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.isSelfEmployed) {
      notifications.general.loadingError();
      return;
    }

    try {
      setIsLoading(true);
      
      const request: BecomeSellerRequest = {
        isSelfEmployed: formData.isSelfEmployed,
        businessName: formData.businessName || undefined,
        businessDescription: formData.businessDescription || undefined
      };

      const updatedUser = await becomeSeller(request);
      
      // Обновляем пользователя в контексте (адаптируем к AuthUser)
      updateUser({
        id: updatedUser.id,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        isActive: updatedUser.isActive,
        role: updatedUser.role
      });

      notifications.subscription.paymentSuccess();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка получения роли продавца:', error);
      notifications.general.loadingError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Стать продавцом</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Информация</h3>
                  <p className="text-sm text-blue-700">
                    Для получения роли продавца необходимо подтвердить статус самозанятого. 
                    Это поможет нам обеспечить качество сервиса.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSelfEmployed"
                  checked={formData.isSelfEmployed}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Я подтверждаю, что являюсь самозанятым
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название бизнеса (необязательно)
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название вашего бизнеса"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание деятельности (необязательно)
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Расскажите о вашей деятельности"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!formData.isSelfEmployed || isLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обработка...
                  </>
                ) : (
                  'Стать продавцом'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};