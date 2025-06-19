import React from 'react';
import { pageStyles } from '../utils/styles';

interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  maxWidth = '3xl',
  className = '' 
}) => {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <main className={pageStyles.wrapper}>
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 ${className}`}>
        {children}
      </div>
    </main>
  );
};

export default PageWrapper; 