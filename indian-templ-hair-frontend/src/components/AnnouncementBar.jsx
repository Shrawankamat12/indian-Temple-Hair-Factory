import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSiteContent } from '../hooks/useStoreData';
import BadgeIcon from './BadgeIcon';
import Container from './Container';

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
    <div className="on-dark h-10 bg-espresso text-[0.78rem] tracking-[0.03em] text-cream">
      <Container className="flex h-full items-center justify-center">
        <ul className="m-0 hidden w-full list-none items-center justify-between gap-6 p-0 lg:flex">
          {messages.map((m) => (
            <li key={m} className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-champagne first:only:mx-auto">
              <BadgeIcon label={m} size={15} /><span>{m}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 max-w-none truncate text-center font-medium text-champagne lg:hidden" aria-live="polite">
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
      </Container>
    </div>
  );
}
