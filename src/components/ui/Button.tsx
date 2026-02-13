'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import {
  Star,
  Smile,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-bold rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary:
      'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105',
    secondary:
      'bg-yellow-300 hover:bg-yellow-400 text-gray-800 shadow-md hover:scale-105',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  
  const icons = {
    primary:  null,
    secondary: null,
    danger: <AlertTriangle className="w-5 h-5" />,
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>กำลังโหลด...</span>
        </>
      ) : (
        <>
          {icon && <span className="w-5 h-5">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
