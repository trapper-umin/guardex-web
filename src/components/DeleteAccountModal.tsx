import React, { useState } from 'react';
import { deleteAccount } from '../services/api';
import { notifications } from '../utils/notifications';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onAccountDeleted: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onAccountDeleted,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  const expectedText = 'УДАЛИТЬ АККАУНТ';
  const isConfirmationValid = confirmationText === expectedText;

  const handleFirstConfirm = () => {
    if (isConfirmationValid) {
      setShowSecondConfirm(true);
    }
  };

  const handleFinalDelete = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      notifications.success('Аккаунт успешно удален');
      onAccountDeleted();
    } catch (error) {
      console.error('Ошибка удаления аккаунта:', error);
      notifications.error(
        error instanceof Error 
          ? error.message 
          : 'Произошла ошибка при удалении аккаунта'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      setShowSecondConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V7H1V9H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9H21M6,9V19H18V9H6Z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-600">Удаление аккаунта</h2>
            <p className="text-gray-600">Это действие необратимо</p>
          </div>
        </div>

        {!showSecondConfirm ? (
          // Первый этап - предупреждение и ввод подтверждения
          <>
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Предупреждение</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Все ваши данные будут удалены</li>
                  <li>• Активные подписки будут отменены</li>
                  <li>• Восстановление будет невозможно</li>
                  <li>• Вы будете автоматически выведены из системы</li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Ваш email: <span className="font-mono font-semibold">{userEmail}</span>
                </p>
                <p className="text-gray-700 mb-4">
                  Для подтверждения введите: <span className="font-mono font-bold text-red-600">{expectedText}</span>
                </p>
                
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Введите текст подтверждения"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isDeleting}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleFirstConfirm}
                disabled={!isConfirmationValid || isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Продолжить
              </button>
            </div>
          </>
        ) : (
          // Второй этап - финальное подтверждение
          <>
            <div className="mb-6">
              <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-6 mb-4">
                <h3 className="text-xl font-bold text-red-800 mb-3 text-center">🔥 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ</h3>
                <p className="text-red-700 text-center font-medium">
                  Вы действительно хотите навсегда удалить свой аккаунт?
                </p>
                <p className="text-red-600 text-center text-sm mt-2">
                  Это действие нельзя будет отменить!
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSecondConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Назад
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Удаление...
                  </>
                ) : (
                  'УДАЛИТЬ НАВСЕГДА'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;