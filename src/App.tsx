import React from 'react';
import Router from './components/Router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Компонент для отображения глобального загрузчика
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Загрузка приложения</h2>
          <p className="text-gray-600">Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  return <Router />;
};

function App() {
  try {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthProvider>
          <AppContent />
          {/* Глобальный контейнер для уведомлений */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="text-sm font-medium"
          />
        </AuthProvider>
      </div>
    );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки приложения</h1>
          <p className="text-gray-600 mb-4">Произошла непредвиденная ошибка. Проверьте консоль браузера для деталей.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Обновить страницу
          </button>
          <pre className="mt-4 text-xs text-left bg-gray-100 p-3 rounded overflow-auto">
            {error?.toString()}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
