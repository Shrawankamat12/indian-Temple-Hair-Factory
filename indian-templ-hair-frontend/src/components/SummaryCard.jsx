import { cx } from '../lib/ui';

/** Sticky order-summary card shared by Cart and Checkout. */
export function SummaryCard({ title, className = '', children, ...rest }) {
  return (
    <aside
      className={cx('rounded-xl border border-line border-t-[3px] border-t-brand bg-white p-[clamp(22px,3vw,32px)] shadow-pop lg:sticky lg:top-[calc(var(--navbar-h,72px)+24px)]', className)}
      {...rest}
    >
      <h2 className="mb-5 text-[1.45rem]">{title}</h2>
      {children}
    </aside>
  );
}

/** Label / value rows. `rows`: [{ label, value, save?, strong? }] */
export function SummaryRows({ rows, className = '' }) {
  return (
    <dl className={cx('m-0 grid gap-3 tabular-nums', className)}>
      {rows.filter(Boolean).map((r) => (
        <div key={r.label} className={cx('flex justify-between gap-4', r.strong && 'border-t border-espresso pt-4')}>
          <dt className={cx(r.save ? 'text-ok' : 'text-muted', r.strong && 'font-display text-xl text-espresso')}>{r.label}</dt>
          <dd className={cx('m-0 text-right font-medium', r.save && 'text-ok', r.strong && 'text-2xl font-bold')}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SummaryTotal({ children }) {
  return (
    <div className="mb-[22px] mt-5 flex items-baseline justify-between border-t border-espresso pt-[18px] tabular-nums">
      <span className="font-display text-xl text-espresso">Total</span>
      <strong className="text-[1.85rem] font-bold tracking-tight text-espresso">{children}</strong>
    </div>
  );
}
