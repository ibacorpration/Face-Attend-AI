import React from 'react';
import styles from './MascotAnimation.module.css';

interface MascotAnimationProps {
  src: string;
  className?: string;
}

const MascotAnimation: React.FC<MascotAnimationProps> = ({ src, className = '' }) => {
  return (
    <div className={`${styles.stage} ${className}`}>
      <div className={styles.particles} aria-hidden="true">
        <span className={styles.particle}></span>
        <span className={styles.particle}></span>
        <span className={styles.particle}></span>
        <span className={styles.particle}></span>
        <span className={styles.particle}></span>
      </div>
      <div className={styles.charWrap}>
        <img className={`${styles.char} w-full h-full object-contain`} src={src} alt="Mascot" />
      </div>
    </div>
  );
};

export default MascotAnimation;
