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
        className={`rounded-[20px] shadow-soft p-6 ${
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
