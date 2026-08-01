import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'purple' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'slate';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'purple',
  size = 'md',
  icon,
  children,
  className,
}) => {
  const variantClasses = {
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-800 text-slate-300 border-white/10',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border',
          variantClasses[variant],
          sizeClasses[size],
          className
        )
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
