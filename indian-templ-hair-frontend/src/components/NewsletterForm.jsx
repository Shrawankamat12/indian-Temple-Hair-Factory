import { useState } from 'react';
import { newsletterApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';

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
    <form className={`nl-form ${className}`} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="nl-email">Email address</label>
      <input id="nl-email" className="input" type="email" required autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</button>
    </form>
  );
}
