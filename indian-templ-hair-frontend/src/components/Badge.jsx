const KIND = { sale: 'badge-sale', dark: 'badge-dark', out: 'badge-out' };

export default function Badge({ kind, children, className = '' }) {
  return <span className={`badge ${KIND[kind] || ''} ${className}`}>{children}</span>;
}
