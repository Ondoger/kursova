import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/gamification';

interface Props {
  value: number;
  format?: 'compact' | 'plain';
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, format = 'plain', duration = 1.6, className }: Props) {
  const ref = useRef<number>(0);
  const [display, setDisplay] = useState<string>(() =>
    format === 'compact' ? formatNumber(0) : '0',
  );

  useEffect(() => {
    const controls = animate(ref.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        ref.current = v;
        setDisplay(format === 'compact' ? formatNumber(Math.round(v)) : Math.round(v).toLocaleString('uk-UA'));
      },
    });
    return () => controls.stop();
  }, [value, duration, format]);

  return <span className={className}>{display}</span>;
}
