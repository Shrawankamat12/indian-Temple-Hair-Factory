import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { cx } from '../lib/ui';

export default function Breadcrumb({ crumbs = [], light = false, className = '' }) {
  const item = light ? 'text-muted' : 'text-cream/70';
  const link = light ? 'text-walnut' : 'text-champagne';
  const current = light ? 'text-ink' : 'text-cream';
  return (
    <nav className={cx('mb-5', className)} aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-y-1 p-0 text-[0.8rem]">
        <li className={cx('inline-flex items-center', item)}>
          <Link to="/" className={cx(link, 'hover:underline hover:underline-offset-4')}>Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`} className={cx('inline-flex items-center', item)}>
            <FiChevronRight size={12} className="mx-2 text-gold" aria-hidden="true" />
            {c.to
              ? <Link to={c.to} className={cx(link, 'hover:underline hover:underline-offset-4')}>{c.label}</Link>
              : <span aria-current="page" className={cx('max-w-[32ch] truncate', current)}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
