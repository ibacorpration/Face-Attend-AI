import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', dot = false, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
    
    const variants = {
      default: "bg-slate-100 text-slate-800",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      error: "bg-rose-100 text-rose-800",
      outline: "border border-slate-200 text-slate-800"
    };

    const dotColors = {
      default: "bg-slate-500",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      outline: "bg-slate-500"
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
