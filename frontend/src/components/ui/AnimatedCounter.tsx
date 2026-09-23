import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1.5, 
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;
    
    const obj = { val: 0 };
    
    gsap.to(obj, {
      val: value,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) {
          el.innerText = `${prefix}${Math.floor(obj.val)}${suffix}`;
        }
      }
    });
  }, [value, duration, prefix, suffix]);

  return <span ref={numberRef} className={className}>0</span>;
};
