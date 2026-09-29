import { useEffect, useRef, useState } from 'react';

/**
 * Light scroll reveal (fade + 14px rise). Same public API as before
 * (`as`, `delay`, `className`, children) so existing usages keep working.
 * Falls back to visible when IntersectionObserver is unavailable; the CSS
 * disables the motion entirely under prefers-reduced-motion.
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
      className={`reveal ${seen ? 'in' : ''} ${className}`}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : null), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
