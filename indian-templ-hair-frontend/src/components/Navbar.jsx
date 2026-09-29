import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiHeart, FiUser, FiShoppingBag, FiChevronDown, FiMenu } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import { useCategories } from '../hooks/useStoreData';
import { menuCategories } from '../lib/categories';
import AnnouncementBar from './AnnouncementBar';
import MegaMenu from './MegaMenu';
import NavSearch from './NavSearch';
import MobileMenu from './MobileMenu';
import logo from '../assets/logo-header.png';

// Company pages stay reachable (routes are unchanged): utility links on desktop, full list in the drawer.
const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/factory', label: 'Our Process' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];
const UTILITY = LINKS.filter((l) => ['/about', '/wholesale', '/contact'].includes(l.to));

export default function Navbar() {
  const { cartCount, wishlist, user } = useStore();
  const { categories: allCategories } = useCategories();
  const categories = menuCategories(allCategories);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef(null);
  const shopRef = useRef(null);
  const megaRef = useRef(null);
  const closeTimer = useRef(null);

  // publish the sticky bar height for pages with their own sticky toolbars
  useEffect(() => {
    const publish = () => document.documentElement.style.setProperty('--navbar-h', `${barRef.current?.offsetHeight || 72}px`);
    publish();
    window.addEventListener('resize', publish);
    return () => window.removeEventListener('resize', publish);
  }, [scrolled]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close everything on route change
  useEffect(() => { setMega(false); setMenuOpen(false); }, [location.pathname, location.search]);

  // Escape closes the mega menu; a click outside BOTH the "Shop" trigger and the mega panel closes it.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMega(false); };
    const onDown = (e) => {
      const inShop = shopRef.current?.contains(e.target);
      const inMega = megaRef.current?.contains(e.target);
      if (!inShop && !inMega) setMega(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = () => { clearTimeout(closeTimer.current); setMega(true); };
  const closeMega = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMega(false), 180); };
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="hdr">
      <AnnouncementBar />
      <div ref={barRef} className={`hdr-bar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container hdr-grid">
          <button type="button" className="icon-btn hdr-burger" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <FiMenu size={22} />
          </button>

          {/* Logo sits in the left column and spans both header rows (search row + category row) */}
          <Link to="/" className="hdr-logo" aria-label="Indian Temple Hair Export, home">
            <img src={logo} alt="Indian Temple Hair Export" width="102" height="92" decoding="async" />
          </Link>

          <NavSearch className="hdr-search" />

          <div className="hdr-actions">
            <Link className="hdr-act hdr-account" to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'}>
              <FiUser size={20} /><span>{user ? 'Account' : 'Sign in'}</span>
            </Link>
            <Link className="hdr-act" to="/wishlist" aria-label={`Wishlist${wishlist.length ? `, ${wishlist.length} items` : ''}`}>
              <FiHeart size={20} /><span>Wishlist</span>
              {wishlist.length > 0 && <span className="hdr-count">{wishlist.length}</span>}
            </Link>
            <Link className="hdr-act" to="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}>
              <FiShoppingBag size={20} /><span>Cart</span>
              {cartCount > 0 && <span className="hdr-count">{cartCount}</span>}
            </Link>
          </div>

          <nav className="hdr-sub" aria-label="Primary">
            <div ref={shopRef} className="hdr-shop" onMouseEnter={openMega} onMouseLeave={closeMega}
              onBlur={(e) => {
                const next = e.relatedTarget;
                if (!e.currentTarget.contains(next) && !megaRef.current?.contains(next)) setMega(false);
              }}>
              <NavLink to="/shop" end className={({ isActive }) => `hdr-link ${isActive ? 'active' : ''}`}>Shop</NavLink>
              <button type="button" className="hdr-chevron" aria-label="Toggle shop menu" aria-expanded={mega} aria-controls="mega-menu"
                onClick={() => (mega ? setMega(false) : openMega())}>
                <FiChevronDown size={14} style={{ transform: mega ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
            {categories.map((c) => (
              <Link key={c.slug} to={`/shop?category=${c.slug}`} className="hdr-link">{c.name}</Link>
            ))}
            <Link to="/shop?onSale=1" className="hdr-link hdr-link--offers">Offers</Link>
            <span className="hdr-sub-util">
              {UTILITY.map((l) => <NavLink key={l.to} to={l.to} className="hdr-util">{l.label}</NavLink>)}
            </span>
          </nav>
        </div>

        <div ref={megaRef} onMouseEnter={openMega} onMouseLeave={closeMega}>
          <MegaMenu id="mega-menu" categories={categories} open={mega} onNavigate={() => setMega(false)} />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} links={LINKS} categories={categories} user={user} wishlistCount={wishlist.length} />
    </header>
  );
}