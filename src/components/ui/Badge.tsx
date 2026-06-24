import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center px-2 py-1 rounded font-label-caps text-label-caps uppercase border';
    
    const variants = {
      success: 'bg-primary-fixed/30 text-primary-container border-primary/20',
      warning: 'bg-[#D4AF37]/20 text-[#574500] border-[#D4AF37]/20',
      danger: 'bg-error-container text-on-error-container border-error/20',
      info: 'bg-secondary-container/50 text-on-secondary-container border-secondary/20',
      default: 'bg-surface-variant text-on-surface-variant border-outline-variant/50',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
