import { FiChevronDown } from 'react-icons/fi';
import { cx, inputCls, labelCls, hintCls, errorCls } from '../lib/ui';

/** Label + control + hint/error wrapper. */
export function Field({ label, htmlFor, hint, error, className = '', children }) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      {label && <label htmlFor={htmlFor} className={labelCls}>{label}</label>}
      {children}
      {hint && !error && <span className={hintCls}>{hint}</span>}
      {error && <span className={errorCls} role="alert">{error}</span>}
    </div>
  );
}

export function Input({ className = '', invalid, ...rest }) {
  return <input className={cx(inputCls, className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Textarea({ className = '', invalid, ...rest }) {
  return <textarea className={cx(inputCls, 'min-h-32 resize-y', className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Select({ className = '', wrapperClassName = '', children, ...rest }) {
  return (
    <div className={cx('relative', wrapperClassName)}>
      <select className={cx(inputCls, 'appearance-none pr-10', className)} {...rest}>{children}</select>
      <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-walnut" size={16} aria-hidden="true" />
    </div>
  );
}

export function Check({ className = '', children, ...rest }) {
  return (
    <label className={cx('flex cursor-pointer items-start gap-2.5 text-[0.88rem] text-ink', className)}>
      <input type="checkbox" className="mt-0.5 size-[17px] flex-none accent-walnut" {...rest} />
      <span>{children}</span>
    </label>
  );
}

export function FormAlert({ kind = 'error', children, className = '' }) {
  const map = {
    error: 'border-[#e4b9bf] bg-sale-soft text-sale',
    ok: 'border-[#bfd6c4] bg-ok-soft text-ok',
  };
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cx('rounded-md border px-3.5 py-3 text-sm', map[kind], className)}>
      {children}
    </div>
  );
}
