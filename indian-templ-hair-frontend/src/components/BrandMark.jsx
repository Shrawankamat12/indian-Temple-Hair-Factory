import { useCompanyInfo } from '../hooks/useStoreData';

/**
 * Shared brand wordmark — simple, editorial, typographic. No emblem
 * or icon shape; the brand name set in the display serif is the mark.
 */
export default function BrandMark({ size = 'md', dark = false, className = '' }) {
  const { company } = useCompanyInfo();
  const dims = { sm: '1.05rem', md: '1.3rem', lg: '1.7rem' }[size] || '1.3rem';
  const color = dark ? '#fff' : 'var(--ink)';

  return (
    <span
      className={`brandmark ${className}`}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontSize: dims,
        color,
        lineHeight: 1,
      }}
    >
      {company.brandName}
    </span>
  );
}
