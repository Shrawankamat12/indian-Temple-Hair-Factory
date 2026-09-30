import { Link } from 'react-router-dom';
import { btn, cx } from '../lib/ui';

/**
 * Single button primitive. Renders a router <Link> when `to` is given,
 * an <a> when `href` is given, otherwise a <button>.
 * variant: primary | dark | outline | gold | light | ghost      size: sm | md | lg
 */
export default function Button({
  to, href, variant = 'primary', size = 'md', block = false, loading = false,
  className = '', children, type = 'button', ...rest
}) {
  const cls = btn(variant, size, cx(block && 'w-full', className));

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return (
    <button type={type} className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}
