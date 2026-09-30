import { useState } from 'react';
import { FiTrendingUp, FiTag, FiUser, FiCreditCard } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { exportCountries } from '../data/content';
import { wholesaleApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import Container from '../components/Container';
import { Field, Input, Textarea } from '../components/Field';
import { cardCls, cx } from '../lib/ui';

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

const steps = [
  ['Send your enquiry', 'Tell us what you need, volumes and destination.'],
  ['Get a quote', 'Pricing, samples and lead time within 24 hours.'],
  ['Production & QC', 'Made and quality-checked at our Delhi factory.'],
  ['Ship worldwide', 'Documentation and air / sea freight arranged.'],
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

      <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container className="grid items-start gap-[clamp(32px,5vw,64px)] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <ul className="m-0 mb-11 grid list-none gap-[22px] p-0">
              {benefits.map(([Icon, t, d]) => (
                <li key={t} className="flex items-start gap-4">
                  <span className="inline-flex size-[42px] flex-none items-center justify-center rounded-full bg-espresso text-champagne"><Icon size={18} aria-hidden="true" /></span>
                  <div><h3 className="mb-1 font-sans text-[1.05rem] font-semibold">{t}</h3><p className="text-[0.9rem] text-muted">{d}</p></div>
                </li>
              ))}
            </ul>

            <SectionHeading as="h2" title="How it works" />
            <ol className="m-0 mb-11 grid list-none gap-3 p-0 sm:grid-cols-2">
              {steps.map(([t, d], i) => (
                <li key={t} className="rounded-lg border border-line bg-white p-4">
                  <span className="mb-1.5 block font-display text-2xl leading-none tabular-nums text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <strong className="block text-[0.95rem] text-espresso">{t}</strong>
                  <span className="text-[0.85rem] text-muted">{d}</span>
                </li>
              ))}
            </ol>

            <SectionHeading as="h2" title="Minimum order quantities" />
            <div className="mb-11 mt-[18px] overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse">
                <thead>
                  <tr className="[&_th]:border-b [&_th]:border-espresso [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[0.72rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-muted">
                    <th scope="col">Product</th><th scope="col">MOQ</th><th scope="col">Lead time</th>
                  </tr>
                </thead>
                <tbody>
                  {moq.map(([p, q, l]) => <tr key={p} className="[&_td]:border-b [&_td]:border-line [&_td]:px-3.5 [&_td]:py-3 [&_td]:text-left [&_td]:text-[0.9rem]"><td>{p}</td><td>{q}</td><td>{l}</td></tr>)}
                </tbody>
              </table>
            </div>

            <SectionHeading as="h2" title="We export to" />
            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {exportCountries.map((c) => <li key={c} className="rounded-full border border-line px-4 py-2 text-[0.84rem] text-muted">{c}</li>)}
              <li className="rounded-full border border-gold px-4 py-2 text-[0.84rem] font-semibold text-walnut">+ 38 more</li>
            </ul>
          </div>

          {sent ? (
            <div className={cx(cardCls, 'p-5 text-center sm:p-8 lg:sticky lg:top-[calc(var(--navbar-h,72px)+24px)]')}>
              <h2 className="mb-2.5 text-[1.7rem]">Thank you</h2>
              <p className="mx-auto mb-5 text-muted">Your enquiry has been received. Our export team will respond within 24 hours.</p>
              <Button variant="outline" size="sm" onClick={() => setSent(false)}>Submit another enquiry</Button>
            </div>
          ) : (
            <form className={cx(cardCls, 'border-t-[3px] border-t-brand p-5 sm:p-8 lg:sticky lg:top-[calc(var(--navbar-h,72px)+24px)]')} onSubmit={onSubmit}>
              <h2 className="text-[1.7rem]">B2B enquiry form</h2>
              <p className="mb-[22px] mt-1.5 text-[0.88rem] text-muted">Our export team responds within 24 hours.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Company name" htmlFor="w-biz"><Input id="w-biz" required {...field('businessName')} /></Field>
                <Field label="Contact person" htmlFor="w-contact"><Input id="w-contact" required {...field('contactName')} /></Field>
                <Field label="Business email" htmlFor="w-email"><Input id="w-email" type="email" required {...field('email')} /></Field>
                <Field label="Phone number" htmlFor="w-phone"><Input id="w-phone" type="tel" required {...field('phone')} /></Field>
                <Field label="Country" htmlFor="w-country"><Input id="w-country" {...field('country')} /></Field>
                <Field className="sm:col-span-2" label="Estimated order volume (kg / pieces)" htmlFor="w-moq"><Input id="w-moq" {...field('estimatedMOQ')} /></Field>
                <Field className="sm:col-span-2" label="What are you looking for?" htmlFor="w-req"><Textarea id="w-req" rows="4" {...field('requirement')} /></Field>
              </div>
              <Button type="submit" size="lg" block loading={submitting} className="mt-5">{submitting ? 'Submitting…' : 'Submit enquiry'}</Button>
            </form>
          )}
        </Container>
      </Reveal>
    </>
  );
}
