import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiX, FiSearch, FiUser, FiHeart } from 'react-icons/fi';
import BrandMark from './BrandMark';
import Overlay from './Overlay';
import { cx, iconBtn } from '../lib/ui';

export default function MobileMenu({ open, onClose, links, categories = [], user, wishlistCount }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const tab = open ? 0 : -1;

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
      <Overlay open={open} onClick={onClose} />
      <aside
        aria-hidden={!open} aria-label="Menu"
        className={cx(
          'on-dark fixed inset-y-0 left-0 z-[80] flex w-[min(90vw,400px)] flex-col overflow-y-auto bg-espresso px-6 pb-7 pt-5 text-cream transition duration-[380ms] ease-soft',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-champagne/20 pb-[18px]">
          <Link to="/" onClick={onClose} tabIndex={tab}><BrandMark tone="light" size="sm" /></Link>
          <button type="button" className={cx(iconBtn, '-mr-2.5 text-cream hover:bg-white/10')} onClick={onClose} aria-label="Close menu" tabIndex={tab}><FiX size={22} /></button>
        </div>

        <form onSubmit={submit} role="search" className="mt-5 flex h-[46px] items-center gap-2.5 rounded-md border border-champagne/20 px-3.5 text-champagne">
          <FiSearch size={16} aria-hidden="true" />
          <input
            type="search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)}
            aria-label="Search products" tabIndex={tab}
            className="min-w-0 flex-1 border-0 bg-transparent text-cream outline-none placeholder:text-cream/70"
          />
        </form>

        <nav className="mt-3 grid" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to} to={l.to} end={l.end} onClick={onClose} tabIndex={tab}
              className={({ isActive }) => cx('border-b border-champagne/20 py-3 font-display text-2xl', isActive ? 'text-champagne' : 'text-cream')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-[26px]">
          <h4 className="mb-3 font-sans text-[0.7rem] font-bold uppercase tracking-[0.16em] text-champagne">Shop by category</h4>
          <ul className="m-0 grid list-none gap-1 p-0">
            <li><Link to="/shop?onSale=1" onClick={onClose} tabIndex={tab} className="block py-2 text-[0.95rem] font-semibold text-[#f0a5b2] hover:text-champagne">Offers</Link></li>
            {categories.map((c) => (
              <li key={c.id || c.slug}><Link to={`/shop?category=${c.slug}`} onClick={onClose} tabIndex={tab} className="block py-2 text-[0.95rem] text-cream/70 hover:text-champagne">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div className="mt-auto grid gap-1 pt-7">
          <Link to={user ? '/account' : '/login'} onClick={onClose} tabIndex={tab} className="flex items-center gap-2.5 py-2.5 text-[0.95rem] text-cream"><FiUser size={16} /> {user ? 'My account' : 'Sign in'}</Link>
          <Link to="/wishlist" onClick={onClose} tabIndex={tab} className="flex items-center gap-2.5 py-2.5 text-[0.95rem] text-cream"><FiHeart size={16} /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>
        </div>
      </aside>
    </>
  );
}
