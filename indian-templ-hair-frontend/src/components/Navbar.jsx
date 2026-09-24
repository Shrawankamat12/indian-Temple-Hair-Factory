import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiHeart, FiUser, FiShoppingBag, FiX, FiChevronDown, FiMenu } from 'react-icons/fi';
import { megaMenu } from '../data/content';
import { useStore } from '../context/StoreContext';
import { useCompanyInfo, useSiteContent } from '../hooks/useStoreData';
import { resolveImageUrl } from '../lib/api';

const DEFAULT_MESSAGES = [
  'Complimentary worldwide shipping on every order',
  'Factory-direct pricing — no middlemen',
  '100% human remy hair, quality checked',
];

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/factory', label: 'Our Process' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const shopItemRef = useRef(null);
  const headerRef = useRef(null);
  const { cartCount, wishlist, user } = useStore();
  const { company } = useCompanyInfo();
  const { siteContent: sc } = useSiteContent();
  const messages = sc?.announcements?.length ? sc.announcements : DEFAULT_MESSAGES;
  const navigate = useNavigate();

  useEffect(() => {
    function publishHeight() {
      document.documentElement.style.setProperty('--navbar-h', `${headerRef.current?.offsetHeight || 0}px`);
    }
    publishHeight();
    window.addEventListener('resize', publishHeight);
    return () => window.removeEventListener('resize', publishHeight);
  }, [scrolled, searchOpen]);

  useEffect(() => {
    function onDocClick(e) {
      if (shopItemRef.current && !shopItemRef.current.contains(e.target)) setMegaOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') { setMegaOpen(false); setSearchOpen(false); } }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 3800);
    return () => clearInterval(t);
  }, [messages.length]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 16); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
      setDrawerOpen(false);
    }
  }

  return (
    <header ref={headerRef} className="hdr">
      <div className="hdr-utility">
        <div className="container hdr-utility-inner">
          <span className="hdr-utility-left">
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {messages[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="hdr-utility-right">
            <Link to="/faq">Help</Link>
            <Link to="/account">Track Order</Link>
          </span>
        </div>
      </div>

      <div className={`hdr-main ${scrolled ? 'scrolled' : ''}`}>
        <div className="hdr-row">
          <button className="hdr-burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <FiMenu size={20} />
          </button>

          <nav className="hdr-nav">
            {links.map((l) =>
              l.label === 'Shop' ? (
                <span key={l.to} ref={shopItemRef} className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
                  <NavLink to={l.to} className={({ isActive }) => `hdr-nav-link ${isActive ? 'active' : ''}`}>
                    {l.label}
                    <FiChevronDown size={12} style={{ marginLeft: 4, display: 'inline', transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
                  </NavLink>
                  <div className={`hdr-mega ${megaOpen ? 'open' : ''}`}>
                    <div className="hdr-mega-grid">
                      {megaMenu.map((col) => (
                        <div className="hdr-mega-col" key={col.title}>
                          <h4>{col.title}</h4>
                          <ul>
                            {col.items.map((it) => (
                              <li key={it}>
                                <Link to="/shop" onClick={() => setMegaOpen(false)}>{it}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link to="/shop" onClick={() => setMegaOpen(false)} className="hdr-mega-feature">
                        <img src={resolveImageUrl(megaMenu[0]?.img)} alt="Shop the collection" />
                        <span className="hdr-mega-feature-label">Shop the collection</span>
                      </Link>
                    </div>
                  </div>
                </span>
              ) : (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `hdr-nav-link ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <Link to="/" className="hdr-logo">{company.brandName}</Link>

          <div className="hdr-actions">
            <button className="hdr-icon-btn" aria-label="Search" onClick={() => setSearchOpen((o) => !o)}>
              <FiSearch size={18} />
            </button>
            <Link className="hdr-icon-btn" to={user ? '/account' : '/login'} aria-label="Account">
              <FiUser size={18} />
            </Link>
            <Link className="hdr-icon-btn" to="/wishlist" aria-label="Wishlist">
              <FiHeart size={18} />
              {wishlist.length > 0 && <span className="hdr-icon-badge">{wishlist.length}</span>}
            </Link>
            <Link className="hdr-icon-btn" to="/cart" aria-label="Cart">
              <FiShoppingBag size={18} />
              {cartCount > 0 && <span className="hdr-icon-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <div className={`hdr-search-panel ${searchOpen ? 'open' : ''}`}>
          <form className="hdr-search-form" onSubmit={submitSearch}>
            <FiSearch size={18} />
            <input
              placeholder="Search hair extensions, wigs, closures…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
              autoFocus={searchOpen}
            />
          </form>
        </div>
      </div>

      <div className={`hdr-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`hdr-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="hdr-drawer-top">
          <span className="hdr-logo" style={{ fontSize: '1.05rem' }}>{company.brandName}</span>
          <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="hdr-icon-btn"><FiX size={18} /></button>
        </div>
        <form className="hdr-drawer-search" onSubmit={submitSearch}>
          <FiSearch size={16} />
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <div className="hdr-drawer-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setDrawerOpen(false)}>{l.label}</NavLink>
          ))}
        </div>
        <div className="hdr-drawer-cats">
          {megaMenu.map((col) => (
            <details key={col.title}>
              <summary>{col.title}</summary>
              <ul>
                {col.items.map((it) => (
                  <li key={it}><Link to="/shop" onClick={() => setDrawerOpen(false)}>{it}</Link></li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </aside>
    </header>
  );
}
