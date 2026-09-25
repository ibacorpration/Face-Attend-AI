import React from 'react';
import styles from './MascotAnimation.module.css';

interface MascotAnimationProps {
  src: string;
  className?: string;
}

const MascotAnimation: React.FC<MascotAnimationProps> = ({ src, className = '' }) => {
  return (
    <div className={styles.stage}>
      <div className={styles.charWrap}>
        <img className={`${styles.char} ${className} object-contain`} src={src} alt="Mascot" />
      </div>
    </div>
  );
};

export default MascotAnimation;
