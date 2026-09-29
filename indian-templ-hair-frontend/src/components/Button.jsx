import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'btn-primary',
  dark: 'btn-dark',
  outline: 'btn-outline',
  gold: 'btn-outline-gold',
  light: 'btn-outline-light',
};

/**
 * Single button primitive. Renders a router <Link> when `to` is given,
 * an <a> when `href` is given, otherwise a <button>.
 */
export default function Button({
  to, href, variant = 'primary', size, block = false, loading = false,
  className = '', children, type = 'button', ...rest
}) {
  const cls = [
    'btn', VARIANTS[variant] || VARIANTS.primary,
    size ? `btn-${size}` : '', block ? 'btn-block' : '', className,
  ].filter(Boolean).join(' ');

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return (
    <button type={type} className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
