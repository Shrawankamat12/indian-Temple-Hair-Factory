import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSiteContent } from '../hooks/useStoreData';
import BadgeIcon from './BadgeIcon';

// Fallbacks only when the admin has not added announcements (Website Content → Header).
// The threshold matches the shipping charge rule in the order service.
const DEFAULT_MESSAGES = [
  'Free shipping on orders above ₹15,000',
  'Cash on delivery available',
  'Easy 7-day returns',
];

/** Dark strip: up to 3 messages side by side on desktop, rotating one at a time on mobile. */
export default function AnnouncementBar() {
  const { siteContent: sc } = useSiteContent();
  const messages = (sc?.announcements?.length ? sc.announcements : DEFAULT_MESSAGES).filter(Boolean).slice(0, 3);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4200);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="ann">
      <div className="container ann-inner">
        <ul className="ann-row">
          {messages.map((m) => (
            <li key={m}><BadgeIcon label={m} size={15} /><span>{m}</span></li>
          ))}
        </ul>
        <p className="ann-msg" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.28 }}
            >
              {messages[i % messages.length]}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
    </div>
  );
}
