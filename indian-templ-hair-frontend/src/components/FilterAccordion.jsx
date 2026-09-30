import { useRef, useState, useEffect } from 'react';
import { cx } from '../lib/ui';

export default function FilterAccordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0);

  useEffect(() => {
    if (!ref.current) return undefined;
    if (open) {
      setHeight(ref.current.scrollHeight);
      const t = setTimeout(() => setHeight('auto'), 260);
      return () => clearTimeout(t);
    }
    setHeight(ref.current.scrollHeight);
    requestAnimationFrame(() => setHeight(0));
    return undefined;
  }, [open]);

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-[0.9rem] font-semibold text-espresso"
      >
        <span>{title}</span>
        <svg className={cx('text-walnut transition-transform duration-[250ms] ease-soft', open && 'rotate-180')} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="overflow-hidden transition-[height] duration-[260ms] ease-soft" style={{ height: height === 'auto' ? 'auto' : `${height}px` }}>
        <div ref={ref} className="pb-[18px]">{children}</div>
      </div>
    </div>
  );
}
