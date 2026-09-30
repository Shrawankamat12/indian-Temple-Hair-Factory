import { cx } from '../lib/ui';

const KIND = {
  sale: 'bg-sale text-cream',
  dark: 'bg-espresso text-champagne',
  out: 'border border-line bg-white text-muted',
  gold: 'bg-gold-soft text-espresso',
};

export default function Badge({ kind = 'gold', children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center rounded-sm px-2 py-[3px] text-[0.66rem] font-bold uppercase leading-normal tracking-[0.08em]', KIND[kind], className)}>
      {children}
    </span>
  );
}
