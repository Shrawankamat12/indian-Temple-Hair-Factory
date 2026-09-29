import { Link, useLocation } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaPinterestP, FaTiktok, FaLinkedinIn, FaCcVisa, FaCcMastercard, FaRupeeSign } from 'react-icons/fa';
import { useSiteContent, useCompanyInfo } from '../hooks/useStoreData';
import NewsletterForm from './NewsletterForm';
import BrandMark from './BrandMark';

function FooterLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  const isExternal = /^https?:\/\//i.test(url);
  return isExternal ? (
    <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link to={url}>{children}</Link>
  );
}

// Fallback columns only when the admin has not configured Footer → Columns.
const DEFAULT_COLUMNS = [
  { title: 'Shop', links: [{ label: 'All Products', url: '/shop' }, { label: 'Offers', url: '/shop?onSale=1' }] },
  { title: 'Customer Care', links: [{ label: 'My Account', url: '/account' }, { label: 'FAQs', url: '/faq' }, { label: 'Contact', url: '/contact' }] },
  { title: 'About Us', links: [{ label: 'Our Story', url: '/about' }, { label: 'Our Process', url: '/factory' }, { label: 'Wholesale', url: '/wholesale' }, { label: 'Journal', url: '/journal' }] },
  { title: 'Policies', links: [
    { label: 'Shipping Policy', url: '/policy/shipping' }, { label: 'Return & Refund', url: '/policy/returns' },
    { label: 'Cancellation', url: '/policy/cancellation' }, { label: 'Privacy Policy', url: '/policy/privacy' }, { label: 'Terms', url: '/policy/terms' },
  ] },
];
const DEFAULT_PAYMENTS = ['Visa', 'Mastercard', 'UPI', 'Cash on Delivery'];

const SOCIAL_ICONS = [
  { key: 'instagram', label: 'Instagram', Icon: FiInstagram },
  { key: 'facebook', label: 'Facebook', Icon: FiFacebook },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'youtube', label: 'YouTube', Icon: FiYoutube },
  { key: 'pinterest', label: 'Pinterest', Icon: FaPinterestP },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok },
];

function PaymentChip({ label }) {
  const l = label.toLowerCase();
  if (l.includes('visa')) return <span className="pay pay-ico" title={label}><FaCcVisa size={30} aria-label={label} /></span>;
  if (l.includes('master')) return <span className="pay pay-ico" title={label}><FaCcMastercard size={30} aria-label={label} /></span>;
  if (l.includes('cod') || l.includes('cash')) return <span className="pay"><FaRupeeSign size={11} aria-hidden="true" />{label}</span>;
  return <span className="pay">{label}</span>;
}

// WhatsApp link: a full URL from the admin, or wa.me built from a number.
function whatsappHref(value, fallbackPhone) {
  if (/^https?:\/\//i.test(value || '')) return value;
  const digits = String(value || fallbackPhone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export default function Footer() {
  const { siteContent: sc } = useSiteContent();
  const { company } = useCompanyInfo();
  const { pathname } = useLocation();
  const footer = sc?.footer || {};
  const columns = footer.columns?.length ? footer.columns : DEFAULT_COLUMNS;
  const payments = footer.paymentMethods?.length ? footer.paymentMethods : DEFAULT_PAYMENTS;
  const social = company.socialLinks;
  const hasSocial = SOCIAL_ICONS.some((i) => social[i.key]);
  const { brandDescription, address, email, phones } = company;
  const waUrl = whatsappHref(social.whatsapp, phones[0]);
  // The home page carries its own newsletter section.
  const showNewsletter = pathname !== '/';

  return (
    <footer className="ftr">
      {showNewsletter && (
        <div className="ftr-news">
          <div className="container ftr-news-inner">
            <div>
              <h2 className="ftr-news-title">Stay in the loop</h2>
              <p className="ftr-news-sub">New arrivals, styling edits and offers, straight to your inbox.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      )}

      <div className="container ftr-grid">
        <div className="ftr-brand">
          <Link to="/" aria-label="Home"><BrandMark tone="light" /></Link>
          <p>{brandDescription}</p>
        </div>

        {columns.map((col) => (
          <nav className="ftr-col" key={col.title} aria-label={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {(col.links || []).map((l) => (
                <li key={l.label}><FooterLink url={l.url}>{l.label}</FooterLink></li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="ftr-col ftr-contact">
          <h3>Connect With Us</h3>
          {hasSocial && (
            <div className="ftr-social">
              {SOCIAL_ICONS.map(({ key, label, Icon }) => {
                const url = key === 'whatsapp' ? waUrl : social[key];
                if (!url) return null;
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
          <address>
            {address && <p><FiMapPin size={14} aria-hidden="true" /><span>{address}</span></p>}
            {email && <p><FiMail size={14} aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></p>}
            {phones.map((phone) => (
              <p key={phone}><FiPhone size={14} aria-hidden="true" /><a href={`tel:${phone.replace(/[\s()-]+/g, '')}`}>{phone}</a></p>
            ))}
          </address>
        </div>
      </div>

      <div className="container">
        <div className="ftr-pay">
          <span className="ftr-pay-label">We accept</span>
          <div className="ftr-pay-row">{payments.map((p) => <PaymentChip key={p} label={p} />)}</div>
        </div>
      </div>

      <div className="ftr-bottom">
        <div className="container ftr-bottom-inner">
          <span>© {new Date().getFullYear()} {company.brandName}. All rights reserved.</span>
          <span>{footer.bottomText || 'Shipped worldwide from New Delhi, India'}</span>
        </div>
      </div>

      {waUrl && (
        <a className="wa-float" href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
          <FaWhatsapp size={28} />
        </a>
      )}
    </footer>
  );
}
