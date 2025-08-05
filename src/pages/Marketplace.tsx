import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { Footer } from '../components';
import { notifications } from '../utils/notifications';
import { getMarketplacePlans, purchaseVpnOffer } from '../services/api';
import PurchaseSuccessModal from '../components/PurchaseSuccessModal';
import type { VpnOffer, PurchaseResponse } from '../utils/types';

const Marketplace: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для данных и фильтров
  const [offers, setOffers] = useState<VpnOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<VpnOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'speed' | 'ping'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [purchasingIds, setPurchasingIds] = useState<Set<string>>(new Set());
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 карточек на страницу

  // Состояния для модального окна успешной покупки
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseResponse | null>(null);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // Загрузка VPN предложений
  useEffect(() => {
    if (isAuthenticated) {
      loadVpnOffers();
    }
  }, [isAuthenticated]);

  const loadVpnOffers = async () => {
    try {
      setIsLoading(true);
      const vpnOffers = await getMarketplacePlans();
      setOffers(vpnOffers);
      setFilteredOffers(vpnOffers);
    } catch (error) {
      console.error('Ошибка загрузки VPN предложений:', error);
      notifications.general.loadingError();
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация и сортировка предложений
  useEffect(() => {
    let filtered = [...offers];

    // Поиск по названию, стране или серверу
    if (searchQuery) {
      filtered = filtered.filter(offer => 
        offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.server.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по стране
    if (countryFilter !== 'all') {
      filtered = filtered.filter(offer => offer.countryCode === countryFilter);
    }

    // Фильтр по плану
    if (planFilter !== 'all') {
      filtered = filtered.filter(offer => offer.plan === planFilter);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.monthlyPrice;
          bValue = b.monthlyPrice;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'speed':
          aValue = parseInt(a.speed);
          bValue = parseInt(b.speed);
          break;
        case 'ping':
          aValue = a.ping;
          bValue = b.ping;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredOffers(filtered);
    
    // Сброс на первую страницу при изменении фильтров
    setCurrentPage(1);
  }, [offers, searchQuery, countryFilter, planFilter, sortBy, sortOrder]);

  // Получение уникальных стран для фильтра
  const uniqueCountries = Array.from(new Set(offers.map(offer => offer.countryCode)))
    .map(code => {
      const offer = offers.find(o => o.countryCode === code);
      return { code, name: offer?.country || '', flag: offer?.flag || '' };
    });

  // Вычисление данных для пагинации
  const totalItems = filteredOffers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffers = filteredOffers.slice(startIndex, endIndex);

  // Функция покупки подписки
  const handlePurchase = async (offerId: string, plan: 'monthly' | 'yearly' = 'monthly') => {
    try {
      setPurchasingIds(prev => new Set(prev).add(offerId));
      
      // Получаем детальный ответ от сервера
      const response = await purchaseVpnOffer(offerId, plan);
      
      // Показываем модальное окно с детальной информацией
      setPurchaseData(response);
      setShowSuccessModal(true);
      
      // Также показываем краткое уведомление
      notifications.subscription.paymentSuccess();
      notifications.general.success('VPN подписка успешно приобретена!');
      
    } catch (error) {
      console.error('Ошибка при покупке:', error);
      
      if (error instanceof Error) {
        // Показываем сообщение об ошибке от сервера
        notifications.general.error(error.message);
      } else {
        notifications.general.error('Произошла неизвестная ошибка при покупке плана');
      }
    } finally {
      setPurchasingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  // Обработчик закрытия модального окна
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPurchaseData(null);
    
    // Опционально: обновляем список предложений
    loadVpnOffers();
  };

  // Функция сброса фильтров
  const resetFilters = () => {
    setSearchQuery('');
    setCountryFilter('all');
    setPlanFilter('all');
    setSortBy('rating');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Если пользователь не авторизован, не показываем содержимое
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Маркетплейс VPN
          </h1>
          <p className="text-gray-600">
            Выберите идеальный VPN-сервер от проверенных продавцов по лучшим ценам
          </p>
        </div>

        {/* Загрузка */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 text-lg">Загрузка VPN предложений...</span>
          </div>
        ) : (
          <>
            {/* Фильтры и поиск */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Поиск */}
                <div className="lg:col-span-2 relative">
                  <input
                    type="text"
                    placeholder="Поиск по названию, стране..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </div>
                </div>

                {/* Фильтр по стране */}
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="pl-3 pr-8 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Все страны</option>
                  {uniqueCountries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>

                {/* Фильтр по плану */}
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
                  className="pl-3 pr-8 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Все планы</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                {/* Сортировка */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as typeof sortBy);
                    setSortOrder(order as typeof sortOrder);
                  }}
                  className="pl-3 pr-8 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating-desc">По рейтингу ↓</option>
                  <option value="price-asc">По цене ↑</option>
                  <option value="price-desc">По цене ↓</option>
                  <option value="speed-desc">По скорости ↓</option>
                  <option value="ping-asc">По пингу ↑</option>
                </select>

                {/* Кнопка сброса фильтров */}
                <button
                  onClick={resetFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200"
                >
                  Сбросить
                </button>
              </div>
            </div>

            {/* Информация о результатах */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Показано {startIndex + 1}-{Math.min(endIndex, totalItems)} из {totalItems} результатов
              </div>
              <div className="text-sm text-gray-600">
                Страница {currentPage} из {totalPages}
              </div>
            </div>

            {/* Результаты */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentOffers.length > 0 ? (
                currentOffers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    {/* Заголовок карточки */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">{offer.flag}</div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{offer.name}</h3>
                          <p className="text-sm text-gray-600">{offer.server}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${offer.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${offer.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {offer.isOnline ? 'Онлайн' : 'Оффлайн'}
                        </span>
                      </div>
                    </div>

                    {/* Бейджи */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        offer.planType === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        offer.planType === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.planType === 'enterprise' ? 'Enterprise' : offer.planType === 'premium' ? 'Premium' : 'Basic'}
                      </span>
                      {offer.isPopular && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Популярный
                        </span>
                      )}
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">
                          {offer.rating} ({offer.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Характеристики */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center bg-gray-50 rounded-xl p-3">
                        <div className="text-sm text-gray-600">Скорость</div>
                        <div className="font-bold text-gray-900">{offer.speed}</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-xl p-3">
                        <div className="text-sm text-gray-600">Пинг</div>
                        <div className="font-bold text-gray-900">{offer.ping}ms</div>
                      </div>
                    </div>

                    {/* Особенности */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Особенности:</h4>
                      <div className="space-y-1">
                        {offer.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                      <div>Uptime: {offer.uptime}%</div>
                      <div>Соединений: {offer.simultaneousConnections}</div>
                      <div>Продавец: {offer.sellerName}</div>
                      <div>Логи: {offer.logPolicy === 'no-logs' ? 'Не ведутся' : 'Минимальные'}</div>
                    </div>

                    {/* Цены и кнопка покупки */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">${offer.monthlyPrice}/мес</div>
                          <div className="text-sm text-gray-600">или ${offer.yearlyPrice}/год</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">
                            Экономия ${(offer.monthlyPrice * 12 - offer.yearlyPrice)}$ в год
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handlePurchase(offer.id, 'monthly')}
                          disabled={purchasingIds.has(offer.id) || !offer.isOnline}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            offer.isOnline 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {purchasingIds.has(offer.id) ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Обработка...
                            </div>
                          ) : (
                            `Купить за $${offer.monthlyPrice}/мес`
                          )}
                        </button>

                        <button
                          onClick={() => handlePurchase(offer.id, 'yearly')}
                          disabled={purchasingIds.has(offer.id) || !offer.isOnline}
                          className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                            offer.isOnline 
                              ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Год за ${offer.yearlyPrice} (выгоднее)
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                  <p className="text-gray-600">Попробуйте изменить фильтры или поисковый запрос</p>
                </div>
              )}
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span className="hidden sm:inline">← </span>Назад
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  Вперед<span className="hidden sm:inline"> →</span>
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Модальное окно успешной покупки */}
      <PurchaseSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        purchaseData={purchaseData}
      />

      <Footer />
    </div>
  );
};

export default Marketplace; 