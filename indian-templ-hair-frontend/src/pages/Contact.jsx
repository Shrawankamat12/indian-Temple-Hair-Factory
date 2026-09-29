import { useState } from 'react';
import { FiMapPin, FiPhone, FiFileText, FiClock, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Button from '../components/Button';
import { contactApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import { useCompanyInfo } from '../hooks/useStoreData';

const emptyForm = { name: '', email: '', subject: '', message: '' };

function InfoCard({ icon, title, children }) {
  return (
    <div className="info-card">
      <span className="info-icon" aria-hidden="true">{icon}</span>
      <div><h3>{title}</h3><div className="info-body">{children}</div></div>
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

  return (
    <>
      <PageHeader crumbs={[{ label: 'Contact' }]} title="Contact us" lede="Questions about an order, a bulk enquiry, or just want to say hello. We're here." tall />
      <Reveal as="section" className="section section--tight">
        <div className="container contact-layout">
          <div className="contact-info">
            <InfoCard icon={<FiMapPin size={18} />} title="Factory address">{company.address}</InfoCard>

            <InfoCard icon={<FiPhone size={18} />} title="Phone & email">
              <span className="info-line">{company.contactPerson}</span>
              {company.phones.map((phone) => {
                const clean = phone.replace(/[\s()-]+/g, '');
                return <a key={phone} href={`tel:${clean}`} className="info-line">{phone}</a>;
              })}
              <a href={`mailto:${company.email}`} className="info-line">{company.email}</a>
            </InfoCard>

            {company.gst && <InfoCard icon={<FiFileText size={18} />} title="GST">{company.gst}</InfoCard>}

            <InfoCard icon={<FiClock size={18} />} title="Business hours">
              {company.businessHours}<br />Closed on national holidays
            </InfoCard>

            <a href={`https://wa.me/${cleanPhone.replace(/^\+/, '')}`} target="_blank" rel="noreferrer" className="whatsapp-cta">
              <FaWhatsapp size={18} aria-hidden="true" /> Chat on WhatsApp
            </a>

            <div className="contact-map">
              <iframe
                title={`${company.brandName} location`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: 220 }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
              />
            </div>
          </div>

          <div className="card card-pad contact-form-wrap">
            {sent ? (
              <div className="contact-sent">
                <span className="oc-mark" aria-hidden="true"><FiCheck size={26} /></span>
                <h2>Message sent</h2>
                <p>Thanks for reaching out. We reply within one business day.</p>
                <Button variant="outline" size="sm" onClick={() => setSent(false)}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="contact-form">
                <h2>Send a message</h2>
                <p className="wsale-form-lede">We reply within one business day.</p>
                <div className="field">
                  <label className="field-label" htmlFor="c-name">Full name</label>
                  <input id="c-name" className="input" placeholder="Enter your full name" required {...field('name')} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-email">Email address</label>
                  <input id="c-email" type="email" className="input" placeholder="you@example.com" required {...field('email')} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-subject">Subject</label>
                  <input id="c-subject" className="input" placeholder="What's this about?" {...field('subject')} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-message">Message</label>
                  <textarea id="c-message" className="textarea" rows="6" placeholder="Tell us a bit more…" required {...field('message')} />
                </div>
                <Button type="submit" size="lg" loading={submitting}>{submitting ? 'Sending…' : 'Send message'}</Button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </>
  );
}
