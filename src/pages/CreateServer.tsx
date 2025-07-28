import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/routes';
import { Footer } from '../components';
import { notifications } from '../utils/notifications';
import { 
  checkServerConnection,
  deployWireGuardWithProgress,
  testServerReadinessWithProgress,
  createVpnService
} from '../services/api';
import type { 
  CreateServerState,
  ServerConnectionData,
  VpnServiceConfig,
  WireGuardDeploymentStep,
  ServerTestResult
} from '../utils/types';

const CreateServer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<CreateServerState>({
    currentStep: 1,
    connectionData: null,
    connectionResult: null,
    deploymentResult: null,
    testingResult: null,
    serviceConfig: null,
    isProcessing: false
  });

  // Формы для каждого шага
  const [connectionForm, setConnectionForm] = useState<ServerConnectionData>({
    ip: '',
    rootPassword: ''
  });

  const [serviceForm, setServiceForm] = useState<VpnServiceConfig>({
    name: '',
    country: '',
    countryCode: '',
    city: '',
    plan: 'basic',
    monthlyPrice: 5,
    yearlyPrice: 50,
    maxConnections: 10,
    bandwidth: '1 ТБ',
    speed: '1 Гбит/с',
    description: '',
    features: [],
    protocols: ['WireGuard', 'OpenVPN']
  });

  const [availableFeatures] = useState([
    'Netflix поддержка',
    'Торрент разрешён', 
    'P2P оптимизация',
    'DDoS защита',
    'Выделенный IP',
    '24/7 поддержка',
    'Игровая оптимизация',
    'Минимальная задержка',
    'Строгие законы о конфиденциальности',
    'Без цензуры',
    'GDPR совместимость',
    'Высокая приватность'
  ]);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // Обработчики для шага 1 - Подключение сервера
  const handleConnectionSubmit = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const result = await checkServerConnection(connectionForm);
      setState(prev => ({
        ...prev,
        connectionData: connectionForm,
        connectionResult: result,
        isProcessing: false,
        currentStep: result.success ? 2 : 1
      }));
      
      if (result.success) {
        notifications.general.success('Подключение к серверу установлено!');
        // Автоматически определяем страну и город из информации о сервере
        if (result.serverInfo?.region) {
          const regionMap: Record<string, {country: string, countryCode: string, city: string}> = {
            'Frankfurt': { country: 'Германия', countryCode: 'DE', city: 'Frankfurt' },
            'New York': { country: 'США', countryCode: 'US', city: 'New York' },
            'London': { country: 'Великобритания', countryCode: 'GB', city: 'London' },
            'Singapore': { country: 'Сингапур', countryCode: 'SG', city: 'Singapore' },
            'Toronto': { country: 'Канада', countryCode: 'CA', city: 'Toronto' }
          };
          
          const regionInfo = regionMap[result.serverInfo.region];
          if (regionInfo) {
            setServiceForm(prev => ({
              ...prev,
              country: regionInfo.country,
              countryCode: regionInfo.countryCode,
              city: regionInfo.city
            }));
          }
        }
             } else {
         notifications.general.loadingError();
       }
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      notifications.general.loadingError();
    }
  };

     // Обработчики для шага 2 - Развертывание WireGuard
   const handleWireGuardDeploy = async () => {
     if (!state.connectionResult?.serverInfo?.ip) return;
     
     setState(prev => ({ ...prev, isProcessing: true }));
     
     try {
       const result = await deployWireGuardWithProgress(
         state.connectionResult.serverInfo.ip,
         (progressResult) => {
           // Обновляем состояние в реальном времени
           setState(prev => ({
             ...prev,
             deploymentResult: progressResult
           }));
         }
       );
       
       setState(prev => ({
         ...prev,
         deploymentResult: result,
         isProcessing: false,
         currentStep: result.success ? 3 : 2
       }));
       
       if (result.success) {
         notifications.general.success('WireGuard успешно установлен!');
       } else {
         notifications.general.loadingError();
       }
     } catch (error) {
       setState(prev => ({ ...prev, isProcessing: false }));
       notifications.general.loadingError();
     }
   };

     // Обработчики для шага 3 - Тестирование
   const startServerTesting = async () => {
     if (!state.connectionResult?.serverInfo?.ip) return;
     
     setState(prev => ({ ...prev, isProcessing: true }));
     
     try {
       const result = await testServerReadinessWithProgress(
         state.connectionResult.serverInfo.ip,
         (progressResult) => {
           // Обновляем состояние в реальном времени
           setState(prev => ({
             ...prev,
             testingResult: progressResult
           }));
         }
       );
       
       setState(prev => ({
         ...prev,
         testingResult: result,
         isProcessing: false,
         currentStep: result.success ? 4 : 3
       }));
       
       if (result.success) {
         notifications.general.success('Сервер готов к работе!');
       } else {
         notifications.general.loadingError();
       }
     } catch (error) {
       setState(prev => ({ ...prev, isProcessing: false }));
       notifications.general.loadingError();
     }
   };

  // Запуск тестирования при переходе на шаг 3
  useEffect(() => {
    if (state.currentStep === 3 && !state.testingResult && !state.isProcessing) {
      startServerTesting();
    }
  }, [state.currentStep]);

  // Обработчики для шага 4 - Настройка сервиса
  const handleServiceSubmit = async () => {
    if (!state.connectionResult?.serverInfo?.ip) return;
    
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      await createVpnService(serviceForm, state.connectionResult.serverInfo.ip);
      notifications.general.success('VPN-сервис успешно создан!');
      navigate(ROUTES.SELLER_DASHBOARD);
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      notifications.general.loadingError();
    }
  };

  const toggleFeature = (feature: string) => {
    setServiceForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Создание VPN-сервера
          </h1>
          <p className="text-gray-600">
            Пошаговое руководство по добавлению нового сервера
          </p>
        </div>

                 {/* Прогресс-бар */}
         <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8 mb-8 overflow-hidden">
           {/* Мобильная версия - вертикальный прогресс */}
           <div className="block sm:hidden">
             <div className="space-y-4">
               {[
                 { step: 1, title: 'Подключение', icon: '🔗', description: 'Подключение к серверу' },
                 { step: 2, title: 'Развертывание', icon: '⚙️', description: 'Установка WireGuard' },
                 { step: 3, title: 'Тестирование', icon: '🧪', description: 'Проверка готовности' },
                 { step: 4, title: 'Настройка', icon: '🛠️', description: 'Настройка сервиса' }
               ].map(({ step, title, icon, description }) => (
                 <div key={step} className="flex items-center">
                   <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${
                     step < state.currentStep 
                       ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white transform scale-105' :
                     step === state.currentStep 
                       ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white transform scale-110 shadow-xl' :
                       'bg-gray-200 text-gray-500'
                   }`}>
                     {step < state.currentStep ? (
                       <span className="text-xl">✓</span>
                     ) : step === state.currentStep ? (
                       <span className="text-xl animate-pulse">{icon}</span>
                     ) : (
                       <span className="text-lg opacity-60">{step}</span>
                     )}
                     {step === state.currentStep && (
                       <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
                     )}
                   </div>
                   <div className="ml-4 flex-1">
                     <div className={`font-semibold text-base transition-colors duration-300 ${
                       step <= state.currentStep ? 'text-gray-900' : 'text-gray-500'
                     }`}>
                       {title}
                     </div>
                     <div className={`text-sm transition-colors duration-300 ${
                       step <= state.currentStep ? 'text-gray-600' : 'text-gray-400'
                     }`}>
                       {description}
                     </div>
                   </div>
                   {step < state.currentStep && (
                     <div className="ml-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>

           {/* Десктопная версия - горизонтальный прогресс */}
           <div className="hidden sm:block">
             <div className="relative">
               {/* Основная линия прогресса */}
               <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
               <div 
                 className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                 style={{ width: `${((state.currentStep - 1) / 3) * 100}%` }}
               ></div>
               
               {/* Шаги */}
               <div className="relative flex justify-between">
                 {[
                   { step: 1, title: 'Подключение', icon: '🔗' },
                   { step: 2, title: 'Развертывание', icon: '⚙️' },
                   { step: 3, title: 'Тестирование', icon: '🧪' },
                   { step: 4, title: 'Настройка', icon: '🛠️' }
                 ].map(({ step, title, icon }) => (
                   <div key={step} className="flex flex-col items-center">
                     <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                       step < state.currentStep 
                         ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl scale-105' :
                       step === state.currentStep 
                         ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl scale-110' :
                         'bg-white border-2 border-gray-300 text-gray-500 shadow-md hover:shadow-lg'
                     }`}>
                       {step < state.currentStep ? (
                         <span className="text-xl animate-bounce">✓</span>
                       ) : step === state.currentStep ? (
                         <span className="text-xl animate-pulse">{icon}</span>
                       ) : (
                         <span className="text-lg">{step}</span>
                       )}
                       
                       {/* Анимация для текущего шага */}
                       {step === state.currentStep && (
                         <>
                           <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
                           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                         </>
                       )}
                       
                       {/* Эффект для завершенных шагов */}
                       {step < state.currentStep && (
                         <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         </div>
                       )}
                     </div>
                     
                     <div className={`mt-3 text-center transition-all duration-300 ${
                       step <= state.currentStep ? 'transform scale-105' : ''
                     }`}>
                       <div className={`font-semibold text-sm transition-colors duration-300 ${
                         step < state.currentStep ? 'text-green-700' :
                         step === state.currentStep ? 'text-blue-700' :
                         'text-gray-500'
                       }`}>
                         {title}
                       </div>
                       
                       {/* Индикатор прогресса под текстом */}
                       <div className="mt-1">
                         {step < state.currentStep && (
                           <div className="w-full h-0.5 bg-green-500 rounded-full"></div>
                         )}
                         {step === state.currentStep && (
                           <div className="w-full h-0.5 bg-blue-500 rounded-full animate-pulse"></div>
                         )}
                         {step > state.currentStep && (
                           <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Прогресс в процентах */}
             <div className="mt-6 text-center">
               <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                 <span className="text-sm font-medium text-gray-700">
                   Прогресс: {Math.round(((state.currentStep - 1) / 3) * 100)}% завершено
                 </span>
               </div>
             </div>
           </div>
         </div>

        {/* Шаг 1: Подключение сервера */}
        {state.currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Подключение к серверу</h2>
              <p className="text-gray-600">Введите данные для подключения к вашему серверу</p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP-адрес сервера
                </label>
                <input
                  type="text"
                  value={connectionForm.ip}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={state.isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Root-пароль
                </label>
                <input
                  type="password"
                  value={connectionForm.rootPassword}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, rootPassword: e.target.value }))}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={state.isProcessing}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <span className="text-blue-500 text-lg mr-3 mt-0.5">🔒</span>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Безопасность</h4>
                    <p className="text-xs text-blue-700">
                      Пароль нигде не сохраняется в открытом виде и используется только для настройки соединения.
                    </p>
                  </div>
                </div>
              </div>

              {state.connectionResult && !state.connectionResult.success && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <span className="text-red-500 text-lg mr-3">❌</span>
                    <p className="text-sm text-red-700">{state.connectionResult.error}</p>
                  </div>
                </div>
              )}

              {state.connectionResult?.success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <span className="text-green-500 text-lg mr-3">✅</span>
                    <h4 className="text-sm font-medium text-green-900">Подключение установлено</h4>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <p><strong>IP:</strong> {state.connectionResult.serverInfo?.ip}</p>
                    <p><strong>ОС:</strong> {state.connectionResult.serverInfo?.os}</p>
                    <p><strong>Регион:</strong> {state.connectionResult.serverInfo?.region}</p>
                    <p><strong>Провайдер:</strong> {state.connectionResult.serverInfo?.provider}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleConnectionSubmit}
                disabled={state.isProcessing || !connectionForm.ip || !connectionForm.rootPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {state.isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Проверка соединения...
                  </div>
                ) : (
                  'Проверить соединение'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Шаг 2: Развертывание WireGuard */}
        {state.currentStep === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Развертывание WireGuard</h2>
              <p className="text-gray-600">
                Готовы ли вы развернуть WireGuard на сервере с IP {state.connectionResult?.serverInfo?.ip}?
              </p>
            </div>

            {!state.deploymentResult && (
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleWireGuardDeploy}
                  disabled={state.isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {state.isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Развертывание...
                    </div>
                  ) : (
                    'Развернуть WireGuard'
                  )}
                </button>
              </div>
            )}

                         {state.deploymentResult && (
               <div className="max-w-4xl mx-auto">
                 <div className="space-y-6">
                   {state.deploymentResult.steps.map((step: WireGuardDeploymentStep) => (
                     <div key={step.id} className={`rounded-2xl border-2 transition-all duration-300 ${
                       step.status === 'completed' ? 'border-green-200 bg-green-50' :
                       step.status === 'running' ? 'border-blue-200 bg-blue-50' :
                       step.status === 'error' ? 'border-red-200 bg-red-50' :
                       'border-gray-200 bg-gray-50'
                     }`}>
                       {/* Заголовок шага */}
                       <div className="flex items-center p-4 pb-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold transition-all duration-300 ${
                           step.status === 'completed' ? 'bg-green-500 text-white scale-105' :
                           step.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                           step.status === 'error' ? 'bg-red-500 text-white' :
                           'bg-gray-300 text-gray-600'
                         }`}>
                           {step.status === 'completed' ? '✓' :
                            step.status === 'running' ? '⟳' :
                            step.status === 'error' ? '✗' : '○'}
                         </div>
                         <div className="flex-1">
                           <h4 className="font-semibold text-lg text-gray-900">{step.name}</h4>
                           {step.details && (
                             <p className={`text-sm mt-1 ${
                               step.status === 'completed' ? 'text-green-700' :
                               step.status === 'running' ? 'text-blue-700' :
                               step.status === 'error' ? 'text-red-700' :
                               'text-gray-600'
                             }`}>
                               {step.details}
                             </p>
                           )}
                         </div>
                         {step.status === 'running' && (
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                         )}
                       </div>

                       {/* Логи выполнения */}
                       {(step.logs && step.logs.length > 0) && (
                         <div className="px-4 pb-4">
                           <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                             <div className="flex items-center mb-2">
                               <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                               <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                               <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                               <span className="text-gray-400 text-xs ml-2">Лог выполнения</span>
                             </div>
                             <div className="text-green-400 space-y-1 max-h-32 overflow-y-auto">
                               {step.logs.map((log, logIndex) => (
                                 <div key={logIndex} className="flex items-start">
                                   <span className="text-gray-500 mr-2 flex-shrink-0">
                                     [{String(logIndex + 1).padStart(2, '0')}]
                                   </span>
                                   <span className={logIndex === step.logs!.length - 1 ? 'animate-pulse' : ''}>
                                     {log}
                                   </span>
                                 </div>
                               ))}
                               {step.status === 'running' && (
                                 <div className="flex items-center text-yellow-400 mt-2">
                                   <div className="animate-spin rounded-full h-3 w-3 border border-yellow-400 border-t-transparent mr-2"></div>
                                   <span className="animate-pulse">Выполнение...</span>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Ошибка */}
                       {step.error && (
                         <div className="px-4 pb-4">
                           <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                             <div className="flex items-center">
                               <span className="text-red-500 text-lg mr-2">⚠️</span>
                               <p className="text-sm text-red-700">{step.error}</p>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>

                {state.deploymentResult.success && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <span className="text-green-500 text-2xl block mb-2">🎉</span>
                    <h4 className="text-green-900 font-medium">WireGuard успешно установлен!</h4>
                  </div>
                )}

                                 {state.deploymentResult.error && (
                   <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                     <span className="text-red-500 text-2xl block mb-2">❌</span>
                     <h4 className="text-red-900 font-medium mb-2">Ошибка развертывания</h4>
                     <p className="text-red-700 text-sm mb-4">{state.deploymentResult.error}</p>
                     <button
                       onClick={handleWireGuardDeploy}
                       disabled={state.isProcessing}
                       className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                     >
                       {state.isProcessing ? (
                         <div className="flex items-center">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           Повторная попытка...
                         </div>
                       ) : (
                         'Повторить попытку'
                       )}
                     </button>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}

        {/* Шаг 3: Тестирование */}
        {state.currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🧪</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Тестирование сервера</h2>
              <p className="text-gray-600">Автоматическая проверка готовности сервера к работе</p>
            </div>

                         {state.testingResult && (
               <div className="max-w-4xl mx-auto">
                 <div className="space-y-6">
                   {state.testingResult.tests.map((test: ServerTestResult) => (
                     <div key={test.id} className={`rounded-2xl border-2 transition-all duration-300 ${
                       test.status === 'passed' ? 'border-green-200 bg-green-50' :
                       test.status === 'running' ? 'border-blue-200 bg-blue-50' :
                       test.status === 'failed' ? 'border-red-200 bg-red-50' :
                       'border-gray-200 bg-gray-50'
                     }`}>
                       {/* Заголовок теста */}
                       <div className="flex items-center p-4 pb-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold transition-all duration-300 ${
                           test.status === 'passed' ? 'bg-green-500 text-white scale-105' :
                           test.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                           test.status === 'failed' ? 'bg-red-500 text-white' :
                           'bg-gray-300 text-gray-600'
                         }`}>
                           {test.status === 'passed' ? '✓' :
                            test.status === 'running' ? '⟳' :
                            test.status === 'failed' ? '✗' : '○'}
                         </div>
                         <div className="flex-1">
                           <h4 className="font-semibold text-lg text-gray-900">{test.name}</h4>
                           {test.details && (
                             <p className={`text-sm mt-1 ${
                               test.status === 'passed' ? 'text-green-700' :
                               test.status === 'running' ? 'text-blue-700' :
                               test.status === 'failed' ? 'text-red-700' :
                               'text-gray-600'
                             }`}>
                               {test.details}
                             </p>
                           )}
                         </div>
                         {test.status === 'running' && (
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                         )}
                       </div>

                       {/* Логи тестирования */}
                       {(test.logs && test.logs.length > 0) && (
                         <div className="px-4 pb-4">
                           <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                             <div className="flex items-center mb-2">
                               <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                               <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                               <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                               <span className="text-gray-400 text-xs ml-2">Лог тестирования</span>
                             </div>
                             <div className="text-cyan-400 space-y-1 max-h-32 overflow-y-auto">
                               {test.logs.map((log, logIndex) => (
                                 <div key={logIndex} className="flex items-start">
                                   <span className="text-gray-500 mr-2 flex-shrink-0">
                                     [{String(logIndex + 1).padStart(2, '0')}]
                                   </span>
                                   <span className={logIndex === test.logs!.length - 1 ? 'animate-pulse' : ''}>
                                     {log}
                                   </span>
                                 </div>
                               ))}
                               {test.status === 'running' && (
                                 <div className="flex items-center text-yellow-400 mt-2">
                                   <div className="animate-spin rounded-full h-3 w-3 border border-yellow-400 border-t-transparent mr-2"></div>
                                   <span className="animate-pulse">Тестирование...</span>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Результат теста */}
                       {test.status === 'passed' && (
                         <div className="px-4 pb-4">
                           <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                             <div className="flex items-center">
                               <span className="text-green-500 text-lg mr-2">✅</span>
                               <div>
                                 <p className="text-sm font-medium text-green-900">Тест пройден успешно</p>
                                 {test.details && (
                                   <p className="text-xs text-green-700 mt-1">{test.details}</p>
                                 )}
                               </div>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Ошибка теста */}
                       {test.error && (
                         <div className="px-4 pb-4">
                           <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                             <div className="flex items-center">
                               <span className="text-red-500 text-lg mr-2">❌</span>
                               <div>
                                 <p className="text-sm font-medium text-red-900">Тест провалился</p>
                                 <p className="text-xs text-red-700 mt-1">{test.error}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>

                {state.testingResult.overallStatus === 'passed' && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <span className="text-green-500 text-2xl block mb-2">🎉</span>
                    <h4 className="text-green-900 font-medium">Сервер готов к работе!</h4>
                  </div>
                )}

                {state.testingResult.overallStatus === 'failed' && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <span className="text-red-500 text-2xl block mb-2">⚠️</span>
                    <h4 className="text-red-900 font-medium">Обнаружены проблемы</h4>
                    <p className="text-red-700 text-sm mt-2">Устраните указанные проблемы и повторите тестирование</p>
                                         <button
                       onClick={startServerTesting}
                       disabled={state.isProcessing}
                       className="mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                     >
                       {state.isProcessing ? (
                         <div className="flex items-center">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           Повторное тестирование...
                         </div>
                       ) : (
                         'Проверить снова'
                       )}
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

                 {/* Шаг 4: Настройка VPN-сервиса */}
         {state.currentStep === 4 && (
           <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
             <div className="text-center mb-8">
               <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <span className="text-white text-2xl">🛠️</span>
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Настройка VPN-сервиса</h2>
               <p className="text-gray-600">Заполните информацию для продажи в маркетплейсе</p>
             </div>

             <div className="max-w-2xl mx-auto space-y-6">
               {/* Основная информация */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Название VPN
                   </label>
                   <input
                     type="text"
                     value={serviceForm.name}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                     placeholder="Premium Germany VPN"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     План
                   </label>
                   <select
                     value={serviceForm.plan}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, plan: e.target.value as 'basic' | 'premium' | 'enterprise' }))}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="basic">Basic</option>
                     <option value="premium">Premium</option>
                     <option value="enterprise">Enterprise</option>
                   </select>
                 </div>
               </div>

               {/* Локация */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Страна
                   </label>
                   <input
                     type="text"
                     value={serviceForm.country}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, country: e.target.value }))}
                     placeholder="Германия"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Код страны
                   </label>
                   <input
                     type="text"
                     value={serviceForm.countryCode}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
                     placeholder="DE"
                     maxLength={2}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Город
                   </label>
                   <input
                     type="text"
                     value={serviceForm.city}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, city: e.target.value }))}
                     placeholder="Frankfurt"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>

               {/* Тарифы */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Цена за месяц (USD)
                   </label>
                   <input
                     type="number"
                     value={serviceForm.monthlyPrice}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                     min="1"
                     max="100"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Цена за год (USD)
                   </label>
                   <input
                     type="number"
                     value={serviceForm.yearlyPrice}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                     min="10"
                     max="1000"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Макс. подключений
                   </label>
                   <input
                     type="number"
                     value={serviceForm.maxConnections}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, maxConnections: parseInt(e.target.value) || 0 }))}
                     min="1"
                     max="1000"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>

               {/* Характеристики */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Пропускная способность
                   </label>
                   <select
                     value={serviceForm.bandwidth}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, bandwidth: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="500 ГБ">500 ГБ</option>
                     <option value="1 ТБ">1 ТБ</option>
                     <option value="2 ТБ">2 ТБ</option>
                     <option value="5 ТБ">5 ТБ</option>
                     <option value="Безлимитно">Безлимитно</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Скорость
                   </label>
                   <select
                     value={serviceForm.speed}
                     onChange={(e) => setServiceForm(prev => ({ ...prev, speed: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="100 Мбит/с">100 Мбит/с</option>
                     <option value="500 Мбит/с">500 Мбит/с</option>
                     <option value="1 Гбит/с">1 Гбит/с</option>
                     <option value="2 Гбит/с">2 Гбит/с</option>
                     <option value="10 Гбит/с">10 Гбит/с</option>
                   </select>
                 </div>
               </div>

               {/* Описание */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Описание
                 </label>
                 <textarea
                   value={serviceForm.description}
                   onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                   placeholder="Краткое описание вашего VPN-сервиса..."
                   rows={3}
                   className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                 />
               </div>

               {/* Особенности */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-4">
                   Особенности
                 </label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {availableFeatures.map((feature) => (
                     <label key={feature} className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                       <input
                         type="checkbox"
                         checked={serviceForm.features.includes(feature)}
                         onChange={() => toggleFeature(feature)}
                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                       />
                       <span className="text-sm text-gray-700">{feature}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <button
                 onClick={handleServiceSubmit}
                 disabled={state.isProcessing || !serviceForm.name || !serviceForm.country || !serviceForm.city}
                 className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed"
               >
                 {state.isProcessing ? (
                   <div className="flex items-center justify-center">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                     Создание сервиса...
                   </div>
                 ) : (
                   'Сохранить и активировать'
                 )}
               </button>
             </div>
           </div>
         )}
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default CreateServer; 