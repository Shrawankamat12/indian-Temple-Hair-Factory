import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import { cx } from '../lib/ui';

export default function Toast() {
  const { toast } = useStore();
  const type = toast ? (typeof toast === 'string' ? 'success' : toast.type || 'success') : null;
  const message = toast ? (typeof toast === 'string' ? toast : toast.message) : null;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={message}
          className={cx(
            'fixed bottom-7 left-1/2 z-[90] flex max-w-[min(92vw,460px)] items-center gap-2.5 rounded-md border-l-[3px] bg-espresso px-5 py-3.5 text-[0.9rem] text-cream shadow-deep',
            type === 'error' ? 'border-l-[#d4667a]' : 'border-l-gold',
          )}
          role={type === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 16, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {type === 'error'
            ? <FiAlertCircle size={18} className="flex-none text-[#f0a5b2]" />
            : <FiCheckCircle size={18} className="flex-none text-champagne" />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
