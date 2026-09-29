import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();
  const type = toast ? (typeof toast === 'string' ? 'success' : toast.type || 'success') : null;
  const message = toast ? (typeof toast === 'string' ? toast : toast.message) : null;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={message}
          className={`toast toast-${type}`}
          role={type === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 16, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {type === 'error' ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
