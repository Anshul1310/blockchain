import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: 'purple' | 'cyan' | 'emerald' | 'none';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  glow = 'none',
  className,
  children,
  ...props
}) => {
  const glowClasses = {
    purple: 'hover:shadow-glow-purple border-purple-500/30',
    cyan: 'hover:shadow-glow-cyan border-cyan-500/30',
    emerald: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-emerald-500/30',
    none: '',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-2xl p-6 border border-white/10 text-slate-100',
          hoverable && 'glass-card-hover cursor-pointer',
          glow !== 'none' && glowClasses[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
