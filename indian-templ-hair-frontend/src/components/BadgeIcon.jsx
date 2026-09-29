import { FiTruck, FiRefreshCw, FiLock, FiGlobe, FiShield, FiTag, FiAward } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

// Picks an icon by keyword from an admin-written label, so editing a badge in the admin
// (Website Content → Hero Banner → Badges) never needs a code change.
const RULES = [
  [/human|remy|hair|temple|authentic|virgin|raw/i, 'hair'],
  [/ship|deliver|dispatch/i, FiTruck],
  [/cod|cash/i, FaRupeeSign],
  [/return|refund|exchange/i, FiRefreshCw],
  [/secure|payment|razorpay|safe|checkout/i, FiLock],
  [/export|world|global|international/i, FiGlobe],
  [/offer|off|sale|discount|coupon/i, FiTag],
  [/quality|certif|donor|trace/i, FiAward],
];

function HairIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3c-2 4 2 6 0 9s-2 6-1 9 M12 3c-2 4 2 6 0 9s-2 6-1 9 M16 3c-2 4 2 6 0 9s-2 6-1 9" />
    </svg>
  );
}

function iconFor(label = '') {
  const hit = RULES.find(([re]) => re.test(label));
  return hit ? hit[1] : FiShield;
}

export default function BadgeIcon({ label, size = 20 }) {
  const Icon = iconFor(label);
  if (Icon === 'hair') return <HairIcon size={size} />;
  return <Icon size={size} aria-hidden="true" />;
}
