import { useState } from 'react';
import { newsletterApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import { cx, btn, inputCls } from '../lib/ui';

/** Newsletter signup. Designed for dark backgrounds (footer / home band). */
export default function NewsletterForm({ className = '' }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, showError } = useStore();

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await newsletterApi.subscribe(email);
      showToast("You're subscribed!");
      setEmail('');
    } catch (err) {
      showError(err, 'Could not subscribe right now');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={cx('flex w-full flex-col gap-2.5 sm:flex-row', className)} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="nl-email">Email address</label>
      <input
        id="nl-email" type="email" required autoComplete="email" placeholder="Your email address"
        value={email} onChange={(e) => setEmail(e.target.value)}
        className={cx(inputCls, 'border-cream/30 bg-white/5 text-cream placeholder:text-cream/55 hover:border-champagne focus:border-champagne focus:ring-champagne/25')}
      />
      <button type="submit" className={btn('primary', 'md', 'sm:flex-none')} disabled={submitting}>
        {submitting ? 'Joining…' : 'Subscribe'}
      </button>
    </form>
  );
}
