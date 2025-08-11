import React from 'react';
import type { SellerServer } from '../../utils/types';

interface ServerCardProps {
  server: SellerServer;
  onToggleStatus: (serverId: string) => void;
  onDelete: (serverId: string) => void;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{server.flag}</span>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">{server.name}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{server.city}, {server.country}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${server.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">План:</span>
          <span className={`font-medium px-2 py-1 rounded text-xs ${
            server.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
            server.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {server.plan === 'enterprise' ? 'Enterprise' : server.plan === 'premium' ? 'Premium' : 'Basic'}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Подключения:</span>
          <span className="text-gray-900 font-medium">{server.currentConnections}/{server.maxConnections}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Месячный доход:</span>
          <span className="text-green-600 font-bold">${server.monthlyRevenue}</span>
        </div>
        <div className="hidden sm:flex justify-between text-sm">
          <span className="text-gray-600">Uptime:</span>
          <span className="text-gray-900 font-medium">{server.uptime}%</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onToggleStatus(server.id)}
          className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
            server.isActive
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          }`}
        >
          {server.isActive ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          onClick={() => onDelete(server.id)}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

