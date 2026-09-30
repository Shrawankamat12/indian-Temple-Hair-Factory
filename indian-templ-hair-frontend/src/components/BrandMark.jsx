import { DEFAULT_COMPANY } from '../data/companyInfo';
import { cx } from '../lib/ui';

/**
 * Typographic wordmark. The brand name is split across two lines so the
 * lock-up stays compact: "Indian Temple" over "Hair Export".
 */
export default function BrandMark({ size = 'md', tone = 'dark', className = '' }) {
  const words = DEFAULT_COMPANY.brandName.trim().split(/\s+/);
  const cut = Math.ceil(words.length / 2);
  const top = words.slice(0, cut).join(' ');
  const bottom = words.slice(cut).join(' ');
  const topSize = { sm: 'text-[1.05rem]', md: 'text-[1.32rem]', lg: 'text-[1.7rem]' }[size];
  const botSize = { sm: 'text-[0.54rem] mt-[5px]', md: 'text-[0.6rem] mt-[7px]', lg: 'text-[0.6rem] mt-[7px]' }[size];
  return (
    <span className={cx('inline-flex flex-col items-start leading-none', className)} aria-label={DEFAULT_COMPANY.brandName}>
      <span className={cx('font-display uppercase tracking-[0.16em]', topSize, tone === 'light' ? 'text-cream' : 'text-espresso')} aria-hidden="true">{top}</span>
      {bottom && (
        <span className={cx('pl-0.5 font-semibold uppercase tracking-[0.46em]', botSize, tone === 'light' ? 'text-champagne' : 'text-walnut')} aria-hidden="true">{bottom}</span>
      )}
    </span>
  );
}
