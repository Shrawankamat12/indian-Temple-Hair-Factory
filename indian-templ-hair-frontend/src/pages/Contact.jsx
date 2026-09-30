import { useState } from 'react';
import { FiMapPin, FiPhone, FiFileText, FiClock, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Button from '../components/Button';
import { contactApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import { useCompanyInfo } from '../hooks/useStoreData';
import Container from '../components/Container';
import { Field, Input, Textarea } from '../components/Field';
import { cardCls, cx } from '../lib/ui';

const emptyForm = { name: '', email: '', subject: '', message: '' };

export function InfoCard({ icon, title, children }) {
  return (
    <div className="mb-3.5 flex items-start gap-4 rounded-lg border border-line bg-white px-[22px] py-5">
      <span className="inline-flex size-[42px] flex-none items-center justify-center rounded-full bg-gold-soft text-espresso" aria-hidden="true">{icon}</span>
      <div><h3 className="mb-1.5 font-sans text-base font-semibold">{title}</h3><div className="flex flex-col gap-1 text-[0.9rem] leading-relaxed text-muted">{children}</div></div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError } = useStore();
  const { company } = useCompanyInfo();
  const cleanPhone = company.phones[0].replace(/[\s()-]+/g, '');
  const mapQuery = encodeURIComponent(company.address);

  function field(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactApi.submit(form);
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      showError(err, 'Could not send your message, please try again');
    } finally {
      setSubmitting(false);
    }
  }

  const infoLine = 'block hover:text-walnut';
  return (
    <>
      <PageHeader crumbs={[{ label: 'Contact' }]} title="Contact us" lede="Questions about an order, a bulk enquiry, or just want to say hello. We're here." tall />
      <Reveal as="section" className="py-9 sm:py-12 lg:py-16">
        <Container className="grid items-stretch gap-[clamp(28px,4vw,44px)] md:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col">
            <InfoCard icon={<FiMapPin size={18} />} title="Factory address">{company.address}</InfoCard>

            <InfoCard icon={<FiPhone size={18} />} title="Phone & email">
              <span className="block">{company.contactPerson}</span>
              {company.phones.map((phone) => {
                const clean = phone.replace(/[\s()-]+/g, '');
                return <a key={phone} href={`tel:${clean}`} className={infoLine}>{phone}</a>;
              })}
              <a href={`mailto:${company.email}`} className={cx(infoLine, 'break-all')}>{company.email}</a>
            </InfoCard>

            {company.gst && <InfoCard icon={<FiFileText size={18} />} title="GST">{company.gst}</InfoCard>}

            <InfoCard icon={<FiClock size={18} />} title="Business hours">
              {company.businessHours}<br />Closed on national holidays
            </InfoCard>

            <a href={`https://wa.me/${cleanPhone.replace(/^\+/, '')}`} target="_blank" rel="noreferrer" className="mb-[18px] flex items-center justify-center gap-2.5 rounded-md bg-[#25d366] px-5 py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5b]">
              <FaWhatsapp size={18} aria-hidden="true" /> Chat on WhatsApp
            </a>

            <div className="min-h-[220px] flex-1 overflow-hidden rounded-lg border border-line">
              <iframe
                title={`${company.brandName} location`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%" height="100%" className="block min-h-[220px] border-0"
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
              />
            </div>
          </div>

          <div className={cx(cardCls, 'flex flex-col p-5 sm:p-8')}>
            {sent ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-8 text-center">
                <span className="mb-3 flex h-[108px] w-[84px] items-end justify-center rounded-t-full border-[1.5px] border-gold bg-white pb-[26px] text-walnut" aria-hidden="true"><FiCheck size={26} /></span>
                <h2 className="text-[1.7rem]">Message sent</h2>
                <p className="mb-2 max-w-[32ch] text-muted">Thanks for reaching out. We reply within one business day.</p>
                <Button variant="outline" size="sm" onClick={() => setSent(false)}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
                <div>
                  <h2 className="text-[1.7rem]">Send a message</h2>
                  <p className="mb-1 mt-1.5 text-[0.88rem] text-muted">We reply within one business day.</p>
                </div>
                <Field label="Full name" htmlFor="c-name"><Input id="c-name" placeholder="Enter your full name" required {...field('name')} /></Field>
                <Field label="Email address" htmlFor="c-email"><Input id="c-email" type="email" placeholder="you@example.com" required {...field('email')} /></Field>
                <Field label="Subject" htmlFor="c-subject"><Input id="c-subject" placeholder="What's this about?" {...field('subject')} /></Field>
                <Field label="Message" htmlFor="c-message"><Textarea id="c-message" rows="6" placeholder="Tell us a bit more…" required {...field('message')} /></Field>
                <Button type="submit" size="lg" loading={submitting}>{submitting ? 'Sending…' : 'Send message'}</Button>
              </form>
            )}
          </div>
        </Container>
      </Reveal>
    </>
  );
}
