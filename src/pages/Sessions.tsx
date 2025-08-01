import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { type SessionResponse } from '../services/api';
import { notifications } from '../utils/notifications';
import { Footer } from '../components';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка активных сессий
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const activeSessions = await authService.getActiveSessions();
      setSessions(activeSessions);
    } catch (error: any) {
      console.error('Ошибка загрузки сессий:', error);
      setError(error.message || 'Ошибка загрузки сессий');
    } finally {
      setIsLoading(false);
    }
  };

  // Отзыв конкретной сессии
  const handleRevokeSession = async (sessionId: number) => {
    try {
      await authService.revokeSession(sessionId);
      notifications.success('Сессия успешно отозвана');
      // Обновляем список сессий
      await loadSessions();
    } catch (error: any) {
      console.error('Ошибка отзыва сессии:', error);
      notifications.error(error.message || 'Ошибка отзыва сессии');
    }
  };

  // Выход из всех устройств
  const handleLogoutAll = async () => {
    if (window.confirm('Вы уверены, что хотите выйти из всех устройств? Это действие необратимо.')) {
      try {
        await authService.logoutAll();
        notifications.success('Выход из всех устройств выполнен');
        // После выхода из всех устройств перенаправляем на логин
        window.location.href = '/login';
      } catch (error: any) {
        console.error('Ошибка выхода из всех устройств:', error);
        notifications.error(error.message || 'Ошибка выхода из всех устройств');
      }
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Определение типа устройства по User-Agent
  const getDeviceType = (deviceInfo: string) => {
    if (!deviceInfo) return 'Неизвестное устройство';
    
    if (deviceInfo.includes('Mobile') || deviceInfo.includes('Android') || deviceInfo.includes('iPhone')) {
      return '📱 Мобильное устройство';
    } else if (deviceInfo.includes('Tablet') || deviceInfo.includes('iPad')) {
      return '📋 Планшет';
    } else {
      return '💻 Компьютер';
    }
  };

  // Загрузка сессий при монтировании компонента
  useEffect(() => {
    loadSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка сессий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Floating элементы */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-40 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок страницы */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-4 border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">Управление сессиями</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Активные сессии
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Управляйте своими активными сессиями и устройствами
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">!</span>
              </div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Кнопка выхода из всех устройств */}
        <div className="mb-8 text-center">
          <button
            onClick={handleLogoutAll}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            🚪 Выйти из всех устройств
          </button>
        </div>

        {/* Список сессий */}
        <div className="grid gap-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Нет активных сессий</h3>
              <p className="text-gray-500">Активные сессии будут отображены здесь</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{getDeviceType(session.deviceInfo).split(' ')[0]}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDeviceType(session.deviceInfo).substring(2)}
                        </h3>
                        {session.isCurrent && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Текущая сессия
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">IP-адрес:</span>
                        <span className="ml-2 font-mono">{session.ipAddress}</span>
                      </div>
                      <div>
                        <span className="font-medium">Создана:</span>
                        <span className="ml-2">{formatDate(session.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Истекает:</span>
                        <span className="ml-2">{formatDate(session.expiresAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Статус:</span>
                        <span className={`ml-2 ${session.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {session.isActive ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                    </div>

                    {session.deviceInfo && (
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-600">Устройство:</span>
                        <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                          {session.deviceInfo}
                        </p>
                      </div>
                    )}
                  </div>

                  {!session.isCurrent && (
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      >
                        Отозвать
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white text-xl">ℹ️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                О сессиях
              </h3>
              <div className="text-blue-800 space-y-2">
                <p>• Сессии автоматически истекают через 30 дней</p>
                <p>• Вы можете иметь максимум 5 активных сессий одновременно</p>
                <p>• При превышении лимита старые сессии автоматически отзываются</p>
                <p>• Текущую сессию нельзя отозвать — используйте обычный выход</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default Sessions;