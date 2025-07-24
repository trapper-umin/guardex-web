import { toast } from 'react-toastify';

const defaultOptions = {
  position: "top-right" as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notifications = {
  success: (message: string, options?: any) => {
    toast.success(message, { ...defaultOptions, ...options });
  },
  
  error: (message: string, options?: any) => {
    toast.error(message, { ...defaultOptions, ...options });
  },
  
  info: (message: string, options?: any) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
  
  warning: (message: string, options?: any) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  // Специальные уведомления для VPN-приложения
  auth: {
    loginSuccess: () => notifications.success('Вход выполнен успешно!'),
    loginError: (error?: string) => notifications.error(error || 'Неверный email или пароль'),
    registerSuccess: () => notifications.success('Регистрация прошла успешно! Добро пожаловать!'),
    registerError: (error?: string) => notifications.error(error || 'Ошибка при регистрации'),
    logoutSuccess: () => notifications.info('Вы вышли из аккаунта'),
  },

  subscription: {
    paymentSuccess: () => notifications.success('Оплата прошла успешно! Подписка активирована.'),
    paymentError: (error?: string) => notifications.error(error || 'Ошибка при оплате подписки'),
    renewalSuccess: () => notifications.success('Подписка успешно продлена!'),
  },

  vpn: {
    configDownloaded: () => notifications.success('VPN конфигурация загружена'),
    configError: () => notifications.error('Не удалось загрузить VPN конфигурацию'),
    keyRegenerated: () => notifications.success('Ключ успешно перегенерирован!'),
    keyRegenerationError: () => notifications.error('Ошибка при перегенерации ключа'),
  },

  general: {
    success: (message: string) => notifications.success(message),
    loadingError: () => notifications.error('Ошибка загрузки данных. Попробуйте обновить страницу.'),
    networkError: () => notifications.error('Проблема с подключением к серверу'),
  }
}; 