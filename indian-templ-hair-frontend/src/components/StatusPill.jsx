import { cx } from '../lib/ui';

const TONE = {
  pending: 'bg-gold-soft text-espresso',
  confirmed: 'border border-line bg-sand text-walnut',
  packed: 'border border-line bg-sand text-walnut',
  shipped: 'bg-chocolate text-champagne',
  delivered: 'bg-[#e4f0e7] text-ok',
  cancelled: 'bg-[#f6e3e6] text-sale',
  returned: 'bg-line text-muted',
};

/** Order-status badge shared by the account pages. */
export function StatusPill({ status }) {
  return (
    <span className={cx('inline-block rounded-full px-3 py-1 text-[0.74rem] font-bold capitalize tracking-[0.04em]', TONE[status || 'pending'] || 'bg-sand text-walnut')}>
      {status || 'pending'}
    </span>
  );
}
