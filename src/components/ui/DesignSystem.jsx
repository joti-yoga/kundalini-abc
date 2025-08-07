import React from 'react';

// 按鈕組件系統
export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none';
  
  const variants = {
    primary: 'bg-slate-200 hover:bg-slate-300 text-slate-900',
    secondary: 'bg-slate-300 hover:bg-slate-400 text-slate-900',
    accent: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    outline: 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-900',
  };
  
  const sizes = {
    sm: 'px-5 py-3 text-sm',
    md: 'px-6 py-4 text-base',
    lg: 'px-8 py-5 text-lg',
    xl: 'px-10 py-6 text-xl',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// 輸入框組件系統
export const Input = ({ 
  size = 'md', 
  error = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-4 text-lg',
  };
  
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500';
  
  return (
    <input 
      className={`${baseClasses} ${sizes[size]} ${stateClasses} ${className}`}
      {...props}
    />
  );
};

// 卡片組件系統
export const Card = ({ 
  variant = 'default', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-200';
  
  const variants = {
    default: 'bg-white shadow-soft border border-secondary-200',
    elevated: 'bg-white shadow-medium',
    floating: 'bg-white shadow-strong',
    glow: 'bg-white shadow-glow border border-primary-200',
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// 文字組件系統
export const Text = ({ 
  variant = 'body', 
  color = 'default', 
  children, 
  className = '', 
  as: Component = 'p',
  ...props 
}) => {
  const variants = {
    h1: 'text-4xl font-bold font-display',
    h2: 'text-3xl font-bold font-display',
    h3: 'text-2xl font-semibold font-display',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs',
  };
  
  const colors = {
    default: 'text-secondary-900',
    muted: 'text-secondary-600',
    light: 'text-secondary-400',
    primary: 'text-primary-600',
    accent: 'text-accent-yellow',
    white: 'text-white',
  };
  
  return (
    <Component 
      className={`${variants[variant]} ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// 容器組件系統
export const Container = ({ 
  size = 'default', 
  children, 
  className = '', 
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-2xl',
    default: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };
  
  return (
    <div 
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 間距組件系統
export const Spacer = ({ size = 'md', direction = 'vertical' }) => {
  const sizes = {
    xs: direction === 'vertical' ? 'h-2' : 'w-2',
    sm: direction === 'vertical' ? 'h-4' : 'w-4',
    md: direction === 'vertical' ? 'h-8' : 'w-8',
    lg: direction === 'vertical' ? 'h-12' : 'w-12',
    xl: direction === 'vertical' ? 'h-16' : 'w-16',
  };
  
  return <div className={sizes[size]} />;
};

// 載入動畫組件
export const Loading = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const colors = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[size]} ${colors[color]}`} />
  );
};

// 徽章組件
export const Badge = ({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  return (
    <span 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default {
  Button,
  Input,
  Card,
  Text,
  Container,
  Spacer,
  Loading,
  Badge,
};