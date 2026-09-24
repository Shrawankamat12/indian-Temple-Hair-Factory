import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp, FaPinterestP, FaTiktok, FaLinkedinIn } from 'react-icons/fa';
import { useSiteContent, useCompanyInfo } from '../hooks/useStoreData';
import NewsletterForm from './NewsletterForm';

function FooterLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  const isExternal = /^https?:\/\//i.test(url);
  return isExternal ? (
    <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link to={url}>{children}</Link>
  );
}

const DEFAULT_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Raw Hair', url: '/shop' },
      { label: 'Extensions', url: '/shop' },
      { label: 'Wigs', url: '/shop' },
      { label: 'Closures & Frontals', url: '/shop' },
      { label: 'Bulk Hair', url: '/shop' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', url: '/about' },
      { label: 'Our Process', url: '/factory' },
      { label: 'Wholesale', url: '/wholesale' },
      { label: 'Journal', url: '/journal' },
      { label: 'Contact', url: '/contact' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'My Account', url: '/account' },
      { label: 'FAQs', url: '/faq' },
      { label: 'Shipping', url: '/policy/shipping' },
      { label: 'Returns', url: '/policy/returns' },
      { label: 'Privacy Policy', url: '/policy/privacy' },
      { label: 'Terms', url: '/policy/terms' },
    ],
  },
];

const DEFAULT_TRUST_BADGES = ['100% Human Hair', 'Quality Checked', 'Ethically Sourced', 'Worldwide Shipping'];

const SOCIAL_ICONS = [
  { key: 'instagram', label: 'Instagram', Icon: FiInstagram },
  { key: 'facebook', label: 'Facebook', Icon: FiFacebook },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'youtube', label: 'YouTube', Icon: FiYoutube },
  { key: 'pinterest', label: 'Pinterest', Icon: FaPinterestP },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok },
];

export default function Footer() {
  const { siteContent: sc } = useSiteContent();
  const { company } = useCompanyInfo();
  const footer = sc?.footer || {};
  const columns = footer.columns?.length ? footer.columns : DEFAULT_COLUMNS;
  const trustBadges = footer.trustBadges?.length ? footer.trustBadges : DEFAULT_TRUST_BADGES;
  const social = company.socialLinks;
  const hasSocial = Object.values(social).some(Boolean);
  const { brandDescription, address, email, phones, gst, contactPerson } = company;

  return (
    <footer className="ftr">
      <div className="ftr-newsletter">
        <div className="container ftr-newsletter-inner">
          <div>
            <div className="ftr-newsletter-title">Stay in the loop</div>
            <p className="ftr-newsletter-sub">New arrivals, styling edits and offers — straight to your inbox.</p>
          </div>
          <NewsletterForm className="ftr-newsletter-form" />
        </div>
      </div>

      <div className="container ftr-top">
        <div>
          <span className="ftr-brand-name">{company.brandName}</span>
          <p>{brandDescription}</p>
          {hasSocial && (
            <div className="ftr-social">
              {SOCIAL_ICONS.map((item) => {
                const url = social[item.key];
                if (!url) return null;
                const IconComp = item.Icon;
                return (
                  <a key={item.key} href={url} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label}>
                    <IconComp size={14} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div className="ftr-col" key={col.title}>
            <h5>{col.title}</h5>
            <ul>
              {(col.links || []).map((l) => (
                <li key={l.label}><FooterLink url={l.url}>{l.label}</FooterLink></li>
              ))}
            </ul>
          </div>
        ))}

        <div className="ftr-col">
          <h5>Contact</h5>
          <p className="ftr-address">{contactPerson}<br />{address}</p>
          <p className="ftr-address"><a href={`mailto:${email}`}>{email}</a></p>
          <p className="ftr-address">
            {phones.map((phone) => {
              const cleanPhone = phone.replace(/[\s()-]+/g, '');
              return <span key={phone}><a href={`tel:${cleanPhone}`}>{phone}</a><br /></span>;
            })}
          </p>
          {gst && <p className="ftr-address" style={{ marginBottom: 0 }}>GST: {gst}</p>}
        </div>
      </div>

      <div className="container ftr-trust">
        {trustBadges.map((badge, index) => (
          <span key={badge}>
            {badge}
            {index < trustBadges.length - 1 ? <span className="dot"> · </span> : null}
          </span>
        ))}
      </div>

      <div className="container ftr-bottom">
        <span>© {new Date().getFullYear()} {company.brandName}. All rights reserved.</span>
        <span>{footer.bottomText || 'Shipped worldwide from New Delhi, India'}</span>
      </div>
    </footer>
  );
}
