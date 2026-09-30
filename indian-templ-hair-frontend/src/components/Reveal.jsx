import { useEffect, useRef, useState } from 'react';
import { cx } from '../lib/ui';

/**
 * Light scroll reveal (fade + rise). Falls back to visible when IntersectionObserver
 * is unavailable and is disabled under prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cx(
        'transition duration-[600ms] ease-soft motion-reduce:translate-y-0 motion-reduce:opacity-100',
        seen ? 'translate-y-0 opacity-100' : 'translate-y-3.5 opacity-0',
        className,
      )}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : null), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
