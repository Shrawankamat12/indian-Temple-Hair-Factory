import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiUser, FiHeart } from 'react-icons/fi';
import { megaMenu } from '../data/content';
import BrandMark from './BrandMark';
import { useState } from 'react';

export default function MobileMenu({ open, onClose, links, categories = [], user, wishlistCount }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setQ(''); onClose();
  }

  return (
    <>
      <div className={`overlay-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`mmenu ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Menu">
        <div className="mmenu-top">
          <Link to="/" onClick={onClose} tabIndex={open ? 0 : -1}><BrandMark tone="light" size="sm" /></Link>
          <button type="button" className="icon-btn mmenu-close" onClick={onClose} aria-label="Close menu" tabIndex={open ? 0 : -1}><FiX size={22} /></button>
        </div>

        <form className="mmenu-search" onSubmit={submit} role="search">
          <FiSearch size={16} aria-hidden="true" />
          <input type="search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" tabIndex={open ? 0 : -1} />
        </form>

        <nav className="mmenu-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose} tabIndex={open ? 0 : -1}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="mmenu-cats">
          <h4>Shop by category</h4>
          <ul>
            <li><Link to="/shop?onSale=1" onClick={onClose} tabIndex={open ? 0 : -1}>Offers</Link></li>
            {categories.length > 0
              ? categories.map((c) => (
                <li key={c.id || c.slug}><Link to={`/shop?category=${c.slug}`} onClick={onClose} tabIndex={open ? 0 : -1}>{c.name}</Link></li>
              ))
              : megaMenu.map((c) => (
                <li key={c.title}><Link to="/shop" onClick={onClose} tabIndex={open ? 0 : -1}>{c.title}</Link></li>
              ))}
          </ul>
        </div>

        <div className="mmenu-foot">
          <Link to={user ? '/account' : '/login'} onClick={onClose} tabIndex={open ? 0 : -1}><FiUser size={16} /> {user ? 'My account' : 'Sign in'}</Link>
          <Link to="/wishlist" onClick={onClose} tabIndex={open ? 0 : -1}><FiHeart size={16} /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>
        </div>
      </aside>
    </>
  );
}
