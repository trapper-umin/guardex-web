import React from 'react';
import type { LucideProps } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<LucideProps>;
  gradient: string;
  iconColor: string;
  textColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  textColor
}) => {
  return (
    <div className={`${gradient} border border-opacity-20 rounded-xl sm:rounded-2xl p-3 sm:p-6`}>
      <div className="flex items-center">
        <div className={`w-8 h-8 sm:w-12 sm:h-12 ${iconColor} rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-4`}>
          <Icon className="text-white w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className={`text-xs sm:text-sm ${textColor.replace('900', '600')}`}>{title}</p>
          <p className={`text-lg sm:text-2xl font-bold ${textColor}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${textColor.replace('900', '700')} hidden sm:block`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
