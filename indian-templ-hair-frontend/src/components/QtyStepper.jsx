import { cx } from '../lib/ui';

/** − / + quantity control. Controlled: pass `value`, `onDec`, `onInc`. */
export default function QtyStepper({ value, onDec, onInc, small = false, disableDec = false, disableInc = false, className = '', label = 'quantity' }) {
  const btn = cx(
    'inline-flex items-center justify-center text-[1.1rem] text-espresso transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40',
    small ? 'h-9 w-[34px]' : 'h-11 w-[42px]',
  );
  return (
    <div className={cx('inline-flex items-center rounded-md border border-line-strong bg-white', className)} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={onDec} disabled={disableDec} aria-label={`Decrease ${label}`}>−</button>
      <span className="min-w-10 text-center font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} onClick={onInc} disabled={disableInc} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}
