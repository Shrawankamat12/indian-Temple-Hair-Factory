import { DEFAULT_COMPANY } from '../data/companyInfo';

/**
 * Typographic wordmark. The brand name is split across two lines so the
 * lock-up stays compact: "Indian Temple" over "Hair Export".
 */
export default function BrandMark({ size = 'md', tone = 'dark', className = '' }) {
  const words = DEFAULT_COMPANY.brandName.trim().split(/\s+/);
  const cut = Math.ceil(words.length / 2);
  const top = words.slice(0, cut).join(' ');
  const bottom = words.slice(cut).join(' ');
  return (
    <span className={`bm bm-${size} bm-${tone} ${className}`} aria-label={DEFAULT_COMPANY.brandName}>
      <span className="bm-top" aria-hidden="true">{top}</span>
      {bottom && <span className="bm-bottom" aria-hidden="true">{bottom}</span>}
    </span>
  );
}
