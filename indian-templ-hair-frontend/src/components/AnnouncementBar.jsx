import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSiteContent, useCompanyInfo } from '../hooks/useStoreData';
import BadgeIcon from './BadgeIcon';
import Container from './Container';

// Fallbacks only when the admin has not added announcements (Website Content → Header).
// Built from the live shipping / payment settings so nothing here can drift from what checkout really does.
// (The business has a no-returns policy, so no returns promise is ever made here.)
function defaultMessages(company) {
  const t = company.shipping?.freeShippingThreshold;
  const list = [];
  if (t > 0) list.push(`Free shipping on orders above ₹${Number(t).toLocaleString('en-IN')}`);
  list.push('Worldwide shipping');
  if (company.codEnabled) list.push('Cash on delivery available');
  return list;
}

/** Dark strip: up to 3 messages side by side on desktop, rotating one at a time on mobile. */
export default function AnnouncementBar() {
  const { siteContent: sc } = useSiteContent();
  const { company } = useCompanyInfo();
  const messages = (sc?.announcements?.length ? sc.announcements : defaultMessages(company)).filter(Boolean).slice(0, 3);
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
