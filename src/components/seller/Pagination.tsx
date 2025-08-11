import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Адаптивная настройка количества видимых страниц
  const [isMobile, setIsMobile] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Функция для плавной смены страницы с анимацией
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;
    
    setIsPageChanging(true);
    
    // Небольшая задержка для анимации
    setTimeout(() => {
      onPageChange(newPage);
      setIsPageChanging(false);
    }, 150);
  };

  // Функция для определения видимых страниц пагинации
  const getVisiblePages = (currentPage: number, totalPages: number, maxVisible: number = 5) => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Корректируем если мы близко к началу
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    }
    
    // Корректируем если мы близко к концу
    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return { pages, startPage, endPage };
  };

  if (totalPages <= 1) return null;

  const maxVisiblePages = isMobile ? 3 : 5;
  const { pages: visiblePages, startPage, endPage } = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <div className="space-y-4">
      {/* Пагинация */}
      <div className={`flex justify-center items-center mt-6 sm:mt-8 ${isMobile ? 'space-x-1' : 'space-x-3'}`}>
        {/* Кнопка "Назад" */}
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isPageChanging}
          className={`${isMobile ? 'px-3 py-2' : 'px-6 py-3'} rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
            currentPage === 1 || isPageChanging
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          {!isMobile && <span className="hidden sm:inline">Назад</span>}
        </button>
        
        <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
          {/* Показать первую страницу если нужно */}
          {!isMobile && startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                disabled={isPageChanging}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  isPageChanging
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-3 text-gray-400 text-sm">...</span>
              )}
            </>
          )}

          {/* Показать видимые страницы */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isPageChanging}
              className={`${isMobile ? 'px-2 py-2 text-sm' : 'px-2 sm:px-4 py-2 sm:py-3'} rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                  : isPageChanging
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Показать последнюю страницу если нужно */}
          {!isMobile && endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-3 text-gray-400 text-sm">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={isPageChanging}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  isPageChanging
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        {/* Кнопка "Вперед" */}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isPageChanging}
          className={`${isMobile ? 'px-3 py-2' : 'px-6 py-3'} rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center gap-2 ${
            currentPage === totalPages || isPageChanging
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {!isMobile && <span className="hidden sm:inline">Вперед</span>}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Дополнительная информация о навигации на мобильных */}
      {isMobile && totalPages > 3 && (
        <div className="flex justify-center mt-4">
          <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
            <span>Страница {currentPage} из {totalPages}</span>
            {currentPage === 1 && (
              <span className="ml-2 text-blue-600">• Свайпните влево →</span>
            )}
            {currentPage === totalPages && (
              <span className="ml-2 text-blue-600">• ← Свайпните вправо</span>
            )}
            {currentPage > 1 && currentPage < totalPages && (
              <span className="ml-2 text-blue-600">• ← → Свайп для навигации</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


