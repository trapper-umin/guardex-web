import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createSubscriptionPlan } from '../../services/api';
import { notifications } from '../../utils/notifications';
import type { SellerServer, SubscriptionPlan, CreateSubscriptionPlanForm } from '../../utils/types';

interface CreatePlanModalProps {
  servers: SellerServer[];
  onClose: () => void;
  onSuccess: (plan: SubscriptionPlan) => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ 
  servers, 
  onClose, 
  onSuccess 
}) => {
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

