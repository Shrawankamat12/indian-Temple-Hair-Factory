import { useSiteContent } from '../hooks/useStoreData';
import BadgeIcon from './BadgeIcon';

// Fallbacks only when the admin has not set any hero badges. Each is backed by store behaviour:
// free shipping above ₹15,000 (order service), COD toggle (settings), 7-day returns, Razorpay.
const DEFAULT_LABELS = ['100% Human Hair', 'Free Shipping above ₹15,000', 'Cash on Delivery', 'Easy 7-Day Returns', 'Secure Payments'];

/**
 * Row of icon pills. Labels come from Website Content → Hero Banner → Badges
 * (or the `labels` prop); the icon is picked by keyword so the admin never touches code.
 */
export default function TrustBadges({ labels, className = '', max = 5 }) {
  const { siteContent } = useSiteContent();
  const list = (labels?.length ? labels : siteContent?.hero?.badges?.length ? siteContent.hero.badges : DEFAULT_LABELS)
    .filter(Boolean).slice(0, max);
  return (
    <ul className={`trust ${className}`}>
      {list.map((label) => (
        <li className="trust-item" key={label}>
          <span className="trust-ico"><BadgeIcon label={label} size={20} /></span>
          <span className="trust-txt">{label}</span>
        </li>
      ))}
    </ul>
  );
}
