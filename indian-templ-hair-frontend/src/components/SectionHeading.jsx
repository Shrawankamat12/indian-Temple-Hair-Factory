import { Link } from 'react-router-dom';
import { cx, linkU } from '../lib/ui';

/** Section title with optional supporting line, gold rule and right-hand action link. */
export default function SectionHeading({ title, sub, action, center = false, rule = false, as: Tag = 'h2', className = '' }) {
  return (
    <div className={cx(
      'mb-6 flex flex-wrap gap-6 sm:mb-8',
      center ? 'flex-col items-center text-center' : 'items-end justify-between',
      className,
    )}>
      <div>
        <Tag className={cx('text-[clamp(1.5rem,2.6vw,2.15rem)]', center ? 'max-w-[26ch]' : 'max-w-[32ch]')}>{title}</Tag>
        {sub && <p className={cx('mt-3 max-w-[52ch] text-muted', center && 'mx-auto')}>{sub}</p>}
        {rule && <span className={cx('mt-[18px] block h-0.5 w-11 bg-gold', center && 'mx-auto')} aria-hidden="true" />}
      </div>
      {action && <Link to={action.to} className={cx(linkU, 'whitespace-nowrap text-[0.82rem]')}>{action.label}</Link>}
    </div>
  );
}
