import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiHeart,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiChevronRight,
  FiCheck,
  FiPhone,
  FiMail,
  FiEdit2,
  FiLifeBuoy,
} from 'react-icons/fi';
import PhotoBlock from '../components/PhotoBlock';
import Button from '../components/Button';
import { LineSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { authApi, ordersApi, usersApi } from '../lib/resources';

const TABS = [
  { key: 'Orders', label: 'Orders', icon: FiPackage },
  { key: 'Tracking', label: 'Tracking', icon: FiTruck },
  { key: 'Addresses', label: 'Addresses', icon: FiMapPin },
  { key: 'Wishlist', label: 'Wishlist', icon: FiHeart },
  { key: 'Profile', label: 'Profile', icon: FiUser },
];

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function Account() {
  const [tab, setTab] = useState('Orders');
  const { user, authChecked, logout, wishlist, showToast, showError } = useStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [addressForm, setAddressForm] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (authChecked && !user) navigate('/login', { state: { from: '/account' } });
  }, [authChecked, user, navigate]);

  useEffect(() => {
    if (!user) return;
    authApi.me().then((res) => {
      setProfile(res.user);
      setProfileForm({ name: res.user.name || '', phone: res.user.phone || '' });
    });
    ordersApi.mine().then((res) => setOrders(res.data)).catch((err) => setOrdersError(err));
  }, [user]);

  if (!user) return null;

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await usersApi.updateProfile(profileForm);
      setProfile((p) => ({ ...p, ...res.data }));
      showToast('Profile updated');
    } catch (err) {
      showError(err, 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await usersApi.addAddress(addressForm);
      setProfile((p) => ({ ...p, addresses: res.data }));
      setAddressForm(null);
      showToast('Address added');
    } catch (err) {
      showError(err, 'Could not save address');
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteAddress(id) {
    try {
      const res = await usersApi.deleteAddress(id);
      setProfile((p) => ({ ...p, addresses: res.data }));
    } catch (err) {
      showError(err, 'Could not remove address');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  // Backend order documents use `orderStatus`, not `status`.
  const trackingOrder =
    orders?.find((o) => !['delivered', 'cancelled', 'returned'].includes(o.orderStatus)) || orders?.[0];

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="container acct-welcome">
        <h1 className="page-title">Welcome, {(user.name || 'there').split(' ')[0]}</h1>
        <p>Manage your orders, addresses and saved pieces.</p>
      </div>

      <div className="section section--tight">
        <div className="container acct">
          {/* ===================== SIDEBAR ===================== */}
          <aside className="acct-side">
            <div className="acct-id">
              <span className="acct-avatar" aria-hidden="true">{initial}</span>
              <div>
                <p className="acct-name">{user.name}</p>
                <p className="acct-mail">{user.email}</p>
              </div>
            </div>
            <nav className="acct-nav" role="tablist" aria-label="Account sections" aria-orientation="vertical">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} type="button" role="tab" aria-selected={active} className={active ? 'is-on' : ''} onClick={() => setTab(t.key)}>
                    <Icon size={17} aria-hidden="true" /> {t.label}
                    {active && <FiChevronRight className="acct-chev" size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </nav>
            <Link to="/contact" className="acct-support"><FiLifeBuoy size={17} aria-hidden="true" /> Support</Link>
            <button type="button" className="acct-out" onClick={handleLogout}><FiLogOut size={16} aria-hidden="true" /> Sign out</button>
          </aside>

          {/* ===================== CONTENT ===================== */}
          <div className="acct-main" role="tabpanel">
            <div className="acct-stats">
              <div><strong className="num">{orders ? orders.length : '–'}</strong><span>Total orders</span></div>
              <div><strong className="num">{orders ? orders.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.orderStatus)).length : '–'}</strong><span>In progress</span></div>
              <div><strong className="num">{wishlist.length}</strong><span>Wishlist items</span></div>
            </div>
            {tab === 'Orders' && (
              <Section title="Your orders" subtitle={orders?.length ? `${orders.length} order${orders.length === 1 ? '' : 's'}` : null}>
                {orders === null && !ordersError ? (
                  <LineSkeleton width="100%" height={160} />
                ) : ordersError ? (
                  <ErrorState
                    message="Could not load your orders."
                    onRetry={() => ordersApi.mine().then((res) => { setOrders(res.data); setOrdersError(null); })}
                  />
                ) : orders.length === 0 ? (
                  <EmptyState title="No orders yet" message="Your placed orders will show up here." action={<Button to="/shop">Start shopping</Button>} />
                ) : (
                  <ul className="orders">
                    {orders.map((o) => (
                      <li key={o._id}>
                        <Link to={`/account/orders/${o._id}`} className="order-row">
                          <span className="order-icon"><FiPackage size={18} aria-hidden="true" /></span>
                          <span className="order-main">
                            <strong>{o.orderNumber}</strong>
                            <span>
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              , {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? '' : 's'}
                            </span>
                          </span>
                          <StatusPill status={o.orderStatus} />
                          <span className="order-total price">{rupee(o.pricing?.grandTotal ?? 0)}</span>
                          <FiChevronRight className="order-chev" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {tab === 'Tracking' && (
              <Section title="Track your order">
                {!trackingOrder ? (
                  <EmptyState title="Nothing to track yet" message="Place an order to see live tracking here." />
                ) : (
                  <div className="card card-pad">
                    <div className="track-head">
                      <div>
                        <p className="track-title">Order {trackingOrder.orderNumber}</p>
                        <p className="track-sub price">{rupee(trackingOrder.pricing?.grandTotal ?? 0)}, {trackingOrder.items?.length || 0} item(s)</p>
                      </div>
                      <StatusPill status={trackingOrder.orderStatus} />
                    </div>
                    <ol className="track">
                      {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(trackingOrder.orderStatus);
                        const done = i <= currentIdx;
                        return (
                          <li key={s} className={done ? 'is-done' : ''}>
                            <span className="track-dot num">{done ? <FiCheck size={14} aria-hidden="true" /> : i + 1}</span>
                            <span className="track-label">{s}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </Section>
            )}

            {tab === 'Addresses' && (
              <Section title="Saved addresses">
                <div className="addr-grid">
                  {profile?.addresses?.map((a) => (
                    <div key={a._id} className="addr">
                      <span className="opt-icon"><FiMapPin size={16} aria-hidden="true" /></span>
                      <div>
                        <p className="addr-label">{a.label || 'Address'}</p>
                        <p className="addr-text">{[a.line1, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')}</p>
                        <button type="button" className="cart-remove" onClick={() => deleteAddress(a._id)}><FiTrash2 size={14} aria-hidden="true" /> Remove</button>
                      </div>
                    </div>
                  ))}
                  {!addressForm && (
                    <button type="button" className="addr addr-add" onClick={() => setAddressForm({ country: 'India' })}>
                      <FiPlus size={20} aria-hidden="true" /> Add new address
                    </button>
                  )}
                </div>

                {!profile?.addresses?.length && !addressForm && (
                  <p className="acct-empty-note">No saved addresses yet. Add one to speed up checkout.</p>
                )}

                {addressForm && (
                  <form onSubmit={addAddress} className="card card-pad addr-form">
                    <div className="form-grid">
                      <Field id="ad-label" label="Label (e.g. Home)" value={addressForm.label} onChange={(v) => setAddressForm((f) => ({ ...f, label: v }))} />
                      <Field id="ad-phone" label="Phone" type="tel" value={addressForm.phone} onChange={(v) => setAddressForm((f) => ({ ...f, phone: v }))} />
                      <Field id="ad-line1" label="Address line 1" className="span-2" value={addressForm.line1} onChange={(v) => setAddressForm((f) => ({ ...f, line1: v }))} required />
                      <Field id="ad-city" label="City" value={addressForm.city} onChange={(v) => setAddressForm((f) => ({ ...f, city: v }))} required />
                      <Field id="ad-state" label="State" value={addressForm.state} onChange={(v) => setAddressForm((f) => ({ ...f, state: v }))} />
                      <Field id="ad-pin" label="PIN code" value={addressForm.pincode} onChange={(v) => setAddressForm((f) => ({ ...f, pincode: v }))} required />
                      <Field id="ad-country" label="Country" value={addressForm.country || 'India'} onChange={(v) => setAddressForm((f) => ({ ...f, country: v }))} />
                    </div>
                    <div className="addr-actions">
                      <Button type="submit" loading={savingAddress}>{savingAddress ? 'Saving…' : 'Save address'}</Button>
                      <Button variant="outline" onClick={() => setAddressForm(null)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </Section>
            )}

            {tab === 'Wishlist' && (
              <Section title="Your wishlist" subtitle={wishlist.length ? `${wishlist.length} saved` : null}>
                {wishlist.length === 0 ? (
                  <EmptyState title="Nothing saved yet" message="Browse the shop and tap the heart icon to save pieces here." action={<Button to="/shop">Browse shop</Button>} />
                ) : (
                  <ul className="acct-wl">
                    {wishlist.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} className="acct-wl-card">
                          <PhotoBlock tone={p.tone} ratio="4/5" src={resolveImageUrl(p.image)} alt={p.name} />
                          <span className="acct-wl-name">{p.name}</span>
                          {p.price != null && <span className="price acct-wl-price">{rupee(p.price)}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {tab === 'Profile' && (
              <Section title="Profile details">
                <div className="card card-pad prof-head">
                  <span className="acct-avatar acct-avatar--lg" aria-hidden="true">{initial}</span>
                  <div>
                    <p className="acct-name">{profileForm.name || user.name || 'Add your name'}</p>
                    <p className="acct-mail">{user.email}</p>
                    {profile?.createdAt && (
                      <p className="prof-since">Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>

                <div className="stats">
                  <SummaryStat label="Orders" value={orders?.length ?? '–'} />
                  <SummaryStat label="Wishlist" value={wishlist?.length ?? 0} />
                  <SummaryStat label="Addresses" value={profile?.addresses?.length ?? 0} />
                </div>

                <form onSubmit={saveProfile} className="card card-pad">
                  <h3 className="co-sub"><FiEdit2 size={13} aria-hidden="true" /> Edit details</h3>
                  <div className="form-grid">
                    <LabeledField id="pf-name" icon={FiUser} label="Full name" placeholder="Your full name" value={profileForm.name} onChange={(v) => setProfileForm((f) => ({ ...f, name: v }))} />
                    <LabeledField id="pf-phone" icon={FiPhone} label="Phone number" placeholder="10-digit mobile number" value={profileForm.phone} onChange={(v) => setProfileForm((f) => ({ ...f, phone: v }))} />
                    <LabeledField id="pf-email" className="span-2" icon={FiMail} label="Email address" value={user.email} disabled hint="Your email is linked to your login and can't be changed here." />
                  </div>
                  <div className="addr-actions"><Button type="submit" loading={savingProfile}>{savingProfile ? 'Saving…' : 'Save changes'}</Button></div>
                </form>
              </Section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusPill({ status }) {
  return <span className={`pill pill-${status || 'pending'}`}>{status || 'pending'}</span>;
}

function Section({ title, subtitle, children }) {
  return (
    <section>
      <div className="acct-sec-head">
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="stat"><strong className="num">{value}</strong><span>{label}</span></div>
  );
}

function LabeledField({ id, icon: Icon, label, placeholder, value, onChange, className = '', required = false, disabled = false, hint }) {
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>{label}</label>
      <span className="iconfield">
        {Icon && <Icon size={16} aria-hidden="true" />}
        <input id={id} className="input" placeholder={placeholder} value={value || ''} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required} disabled={disabled} />
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function Field({ id, label, value, onChange, className = '', required = false, type = 'text' }) {
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input id={id} type={type} className="input" value={value || ''} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required} />
    </div>
  );
}
