import { Link, useLocation } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiMail, FiPhone, FiClock } from 'react-icons/fi';
import { FaWhatsapp, FaPinterestP, FaTiktok, FaLinkedinIn, FaCcVisa, FaCcMastercard, FaDollarSign } from 'react-icons/fa';
import { useSiteContent, useCompanyInfo } from '../hooks/useStoreData';
import { useAsync } from '../hooks/useAsync';
import { paymentsApi } from '../lib/resources';
import NewsletterForm from './NewsletterForm';
import BrandMark from './BrandMark';
import Container from './Container';
import { cx } from '../lib/ui';

const linkCls = 'inline-block text-cream/70 transition duration-200 hover:translate-x-[3px] hover:text-champagne';

function FooterLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  const isExternal = /^https?:\/\//i.test(url);
  return isExternal ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={linkCls}>{children}</a>
  ) : (
    <Link to={url} className={linkCls}>{children}</Link>
  );
}

// Fallback columns only when the admin has not configured Footer → Columns.
const DEFAULT_COLUMNS = [
  { title: 'Shop', links: [{ label: 'All Products', url: '/shop' }, { label: 'Offers', url: '/shop?onSale=1' }] },
  { title: 'Customer Care', links: [{ label: 'My Account', url: '/account' }, { label: 'FAQs', url: '/faq' }, { label: 'Contact', url: '/contact' }] },
  { title: 'About Us', links: [{ label: 'Our Story', url: '/about' }, { label: 'Our Process', url: '/factory' }, { label: 'Wholesale', url: '/wholesale' }, { label: 'Journal', url: '/journal' }] },
  { title: 'Policies', links: [
    { label: 'Shipping Policy', url: '/policy/shipping' }, { label: 'Return Policy', url: '/policy/returns' }, { label: 'Refund Policy', url: '/policy/refund' },
    { label: 'Cancellation', url: '/policy/cancellation' }, { label: 'Privacy Policy', url: '/policy/privacy' }, { label: 'Terms', url: '/policy/terms' },
  ] },
];

const SOCIAL_ICONS = [
  { key: 'instagram', label: 'Instagram', Icon: FiInstagram },
  { key: 'facebook', label: 'Facebook', Icon: FiFacebook },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'youtube', label: 'YouTube', Icon: FiYoutube },
  { key: 'pinterest', label: 'Pinterest', Icon: FaPinterestP },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok },
];

const payBase = 'inline-flex min-h-[30px] items-center gap-1.5 rounded border border-champagne/20 px-3 text-[0.74rem] font-semibold tracking-[0.04em]';

function PaymentChip({ label }) {
  const l = label.toLowerCase();
  if (l.includes('visa')) return <span className={cx(payBase, 'bg-white px-1.5 text-espresso')} title={label}><FaCcVisa size={30} aria-label={label} /></span>;
  if (l.includes('master')) return <span className={cx(payBase, 'bg-white px-1.5 text-espresso')} title={label}><FaCcMastercard size={30} aria-label={label} /></span>;
  if (l.includes('cod') || l.includes('cash')) return <span className={cx(payBase, 'bg-white/5 text-cream')}><FaDollarSign size={11} aria-hidden="true" />{label}</span>;
  return <span className={cx(payBase, 'bg-white/5 text-cream')}>{label}</span>;
}

// WhatsApp link: a full URL from the admin, or wa.me built from a number.
function whatsappHref(value, fallbackPhone) {
  if (/^https?:\/\//i.test(value || '')) return value;
  const digits = String(value || fallbackPhone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

// Strips any GSTIN (15-char GST number) that may be saved inside admin text fields.
const stripGst = (t) =>
  (t || '').replace(/[\s.,|\u2022\u00b7-]*GSTIN[:\s-]*[0-9A-Z]{15}/gi, '').trim();

const colHead = 'mb-[18px] font-sans text-[0.72rem] font-bold uppercase tracking-[0.16em] text-champagne';

export default function Footer() {
  const { siteContent: sc } = useSiteContent();
  const { company } = useCompanyInfo();
  const { pathname } = useLocation();
  const footer = sc?.footer || {};
  const columns = footer.columns?.length ? footer.columns : DEFAULT_COLUMNS;
  // "We accept": the admin's list wins; otherwise show only what checkout really offers right now.
  const { data: methodsRes } = useAsync(() => paymentsApi.methods(), []);
  const live = methodsRes?.data;
  const livePayments = [live?.paypal?.enabled && 'PayPal', live?.cod?.enabled && 'Cash on Delivery'].filter(Boolean);
  const payments = footer.paymentMethods?.length ? footer.paymentMethods : livePayments;
  const social = company.socialLinks;
  const hasSocial = SOCIAL_ICONS.some((i) => social[i.key]);
  const { brandDescription, address, email, phones, businessHours } = company;
  const waUrl = whatsappHref(social.whatsapp, phones[0]);
  // The home page carries its own newsletter section.
  const showNewsletter = pathname !== '/';

  // Brand + N link columns + contact, all on ONE row from 1024px up.
  // Built from the real column count so admin-configured footers also fit.
  const desktopCols = `minmax(0,1.4fr) repeat(${columns.length}, minmax(0,1fr)) minmax(0,1.5fr)`;

  return (
    <footer className="on-dark relative border-t-[3px] border-gold bg-espresso text-[0.9rem] text-cream/70">
      {showNewsletter && (
        <div className="border-b border-champagne/20 bg-chocolate">
          <Container className="grid items-center gap-8 py-9 md:grid-cols-[1fr_minmax(320px,480px)] md:py-11">
            <div>
              <h2 className="text-[1.8rem] text-cream">Stay in the loop</h2>
              <p className="mt-1.5 text-cream/70">New arrivals, styling edits and offers, straight to your inbox.</p>
            </div>
            <NewsletterForm />
          </Container>
        </div>
      )}

      <Container
        className="grid grid-cols-2 gap-x-5 gap-y-8 pb-8 pt-12 sm:gap-8 sm:pb-9 sm:pt-14 md:grid-cols-3 lg:gap-x-6 lg:[grid-template-columns:var(--footer-cols)]"
        style={{ '--footer-cols': desktopCols }}
      >
        <div className="col-span-full lg:col-span-1">
          <Link to="/" aria-label="Home"><BrandMark tone="light" /></Link>
          <p className="mt-5 max-w-[34ch] leading-[1.7]">{stripGst(brandDescription)}</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className={colHead}>{col.title}</h3>
            <ul className="m-0 grid list-none gap-[11px] p-0">
              {(col.links || []).map((l) => (
                <li key={l.label}><FooterLink url={l.url}>{l.label}</FooterLink></li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-full sm:col-span-2 md:col-span-3 lg:col-span-1">
          <h3 className={colHead}>Connect With Us</h3>
          {hasSocial && (
            <div className="mb-[18px] flex flex-wrap gap-2.5">
              {SOCIAL_ICONS.map(({ key, label, Icon }) => {
                const url = key === 'whatsapp' ? waUrl : social[key];
                if (!url) return null;
                return (
                  <a
                    key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-champagne/20 text-champagne transition duration-200 ease-soft hover:border-gold hover:bg-gold hover:text-espresso"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
          <address className="grid gap-2.5 not-italic [&_svg]:mt-1 [&_svg]:flex-none [&_svg]:text-champagne">
            {address && <p className="m-0 flex items-start gap-2.5 leading-[1.55]"><FiMapPin size={14} aria-hidden="true" /><span>{address}</span></p>}
            {email && <p className="m-0 flex items-start gap-2.5 leading-[1.55]"><FiMail size={14} aria-hidden="true" /><a href={`mailto:${email}`} className="break-all hover:text-champagne">{email}</a></p>}
            {phones.map((phone) => (
              <p key={phone} className="m-0 flex items-start gap-2.5 leading-[1.55]"><FiPhone size={14} aria-hidden="true" /><a href={`tel:${phone.replace(/[\s()-]+/g, '')}`} className="hover:text-champagne">{phone}</a></p>
            ))}
            {businessHours && <p className="m-0 flex items-start gap-2.5 leading-[1.55]"><FiClock size={14} aria-hidden="true" /><span>{businessHours}</span></p>}
          </address>
        </div>
      </Container>

      {payments.length > 0 && (
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-champagne/20 py-5">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-champagne">We accept</span>
            <div className="flex flex-wrap items-center gap-2">{payments.map((p) => <PaymentChip key={p} label={p} />)}</div>
          </div>
        </Container>
      )}

      <div className="border-t border-champagne/20 bg-black/20">
        <Container className="flex flex-col items-center gap-x-6 gap-y-2 py-5 text-center text-[0.8rem] sm:flex-row sm:flex-wrap sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} {company.brandName}. All rights reserved.</span>
          {stripGst(footer.bottomText) && <span>{stripGst(footer.bottomText)}</span>}
        </Container>
      </div>

      {waUrl && (
        <a
          href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
          className="fixed bottom-[18px] right-[18px] z-[55] inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_24px_-8px_rgb(0_0_0/0.5)] transition-transform duration-200 ease-soft hover:scale-[1.06]"
        >
          <FaWhatsapp size={28} />
        </a>
      )}
    </footer>
  );
}