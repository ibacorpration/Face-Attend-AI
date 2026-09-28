import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<"div"> {
  className?: string;
  tinted?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', tinted = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`rounded-[20px] shadow-soft p-6 hover:shadow-[0_20px_40px_rgba(91,42,114,0.15)] transition-shadow duration-300 ${
          tinted ? 'bg-surface-tint border-none' : 'bg-surface border border-slate-100'
        } ${className}`}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';
