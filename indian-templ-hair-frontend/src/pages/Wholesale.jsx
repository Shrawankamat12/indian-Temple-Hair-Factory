import { useState } from 'react';
import { FiTrendingUp, FiTag, FiUser, FiCreditCard } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { exportCountries } from '../data/content';
import { wholesaleApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';

const benefits = [
  [FiTag, 'Factory-Direct Pricing', 'Skip resellers entirely and buy at the same rate our own distributors do.'],
  [FiTrendingUp, 'Private Labelling', 'Custom packaging and batch tagging available on qualifying orders.'],
  [FiUser, 'Dedicated Account Manager', 'A single point of contact for reordering, documentation and shipping updates.'],
  [FiCreditCard, 'Flexible Payment Terms', 'LC, T/T and partial-advance terms available for established partners.'],
];

const moq = [
  ['Raw bundles', '25 kg', '7–10 days'],
  ['Wefted extensions', '50 bundles', '10–14 days'],
  ['Closures & frontals', '30 pieces', '10–14 days'],
  ['Wigs', '20 pieces', '14–18 days'],
];

const emptyForm = { businessName: '', contactName: '', email: '', phone: '', country: '', estimatedMOQ: '', requirement: '' };

export default function Wholesale() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError } = useStore();

  function field(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await wholesaleApi.submit(form);
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      showError(err, 'Could not submit your enquiry, please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader crumbs={[{ label: 'Export / Wholesale' }]} title="Export & Wholesale Enquiry" lede="Bulk pricing, MOQs and export documentation for salons, distributors and importers." />

      <Reveal as="section" className="section">
        <div className="container wsale-layout">
          <div>
            <ul className="wsale-benefits">
              {benefits.map(([Icon, t, d]) => (
                <li key={t}>
                  <span className="wsale-icon"><Icon size={18} aria-hidden="true" /></span>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>

            <SectionHeading as="h2" title="Minimum order quantities" />
            <table className="moq-table">
              <thead><tr><th scope="col">Product</th><th scope="col">MOQ</th><th scope="col">Lead time</th></tr></thead>
              <tbody>
                {moq.map(([p, q, l]) => <tr key={p}><td>{p}</td><td>{q}</td><td>{l}</td></tr>)}
              </tbody>
            </table>

            <SectionHeading as="h2" title="We export to" />
            <ul className="countries countries--light">
              {exportCountries.map((c) => <li key={c}>{c}</li>)}
              <li className="is-more">+ 38 more</li>
            </ul>
          </div>

          {sent ? (
            <div className="card card-pad wsale-sent">
              <h2>Thank you</h2>
              <p>Your enquiry has been received. Our export team will respond within 24 hours.</p>
              <Button variant="outline" size="sm" onClick={() => setSent(false)}>Submit another enquiry</Button>
            </div>
          ) : (
            <form className="card card-pad" onSubmit={onSubmit}>
              <h2>B2B enquiry form</h2>
              <p className="wsale-form-lede">Our export team responds within 24 hours.</p>
              <div className="form-grid">
                <div className="field span-2"><label className="field-label" htmlFor="w-biz">Company name</label><input id="w-biz" className="input" required {...field('businessName')} /></div>
                <div className="field"><label className="field-label" htmlFor="w-contact">Contact person</label><input id="w-contact" className="input" required {...field('contactName')} /></div>
                <div className="field"><label className="field-label" htmlFor="w-email">Business email</label><input id="w-email" type="email" className="input" required {...field('email')} /></div>
                <div className="field"><label className="field-label" htmlFor="w-phone">Phone number</label><input id="w-phone" type="tel" className="input" required {...field('phone')} /></div>
                <div className="field"><label className="field-label" htmlFor="w-country">Country</label><input id="w-country" className="input" {...field('country')} /></div>
                <div className="field span-2"><label className="field-label" htmlFor="w-moq">Estimated order volume (kg / pieces)</label><input id="w-moq" className="input" {...field('estimatedMOQ')} /></div>
                <div className="field span-2"><label className="field-label" htmlFor="w-req">What are you looking for?</label><textarea id="w-req" className="textarea" rows="4" {...field('requirement')} /></div>
              </div>
              <Button type="submit" loading={submitting} className="wsale-submit">{submitting ? 'Submitting…' : 'Submit enquiry'}</Button>
            </form>
          )}
        </div>
      </Reveal>
    </>
  );
}
