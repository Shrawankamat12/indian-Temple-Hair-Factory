import { useSiteContent } from '../hooks/useStoreData';
import BadgeIcon from './BadgeIcon';
import { cx } from '../lib/ui';

/**
 * Row of icon pills. Labels come from Website Content → Hero Banner → Badges
 * (or the `labels` prop); the icon is picked by keyword so the admin never touches code.
 * variant: "pills" (wrapping, centered) | "strip" (single scrolling row inside a floating white card)
 */
export default function TrustBadges({ labels, className = '', max = 5, variant = 'pills' }) {
  const { siteContent } = useSiteContent();
  const list = (labels?.length ? labels : siteContent?.hero?.badges || [])
    .filter(Boolean).slice(0, max);
  if (list.length === 0) return null;
  const strip = variant === 'strip';
  return (
    <ul className={cx(
      'm-0 flex list-none gap-2.5 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      strip
        ? 'justify-start gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-pop lg:justify-between'
        : 'justify-start pb-1 sm:flex-wrap sm:justify-center sm:gap-x-3.5',
      className,
    )}>
      {list.map((label) => (
        <li
          key={label}
          className={cx(
            'inline-flex flex-none items-center gap-2.5 text-[0.82rem] font-medium text-espresso',
            strip ? 'py-1 pl-1 pr-3' : 'rounded-full border border-line bg-white py-2 pl-2 pr-[18px]',
          )}
        >
          <span className="inline-flex size-8 flex-none items-center justify-center rounded-full bg-sand text-brand">
            <BadgeIcon label={label} size={18} />
          </span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
