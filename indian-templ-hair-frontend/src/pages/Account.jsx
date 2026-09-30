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
import Container from '../components/Container';
import PageTitle from '../components/PageTitle';
import SectionWrap from '../components/Section';
import { cardCls, cx, labelCls, hintCls, inputCls } from '../lib/ui';
import { StatusPill } from '../components/StatusPill';

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

  const navBtn = 'flex items-center gap-3 rounded-md border-0 px-3 py-3 text-left font-medium text-ink transition-colors hover:bg-cream aria-selected:bg-brand aria-selected:text-white max-[900px]:flex-none max-[900px]:whitespace-nowrap [&>svg:first-child]:text-muted aria-selected:[&>svg:first-child]:text-white';

  return (
    <>
      <PageTitle sub="Manage your orders, addresses and saved pieces.">Welcome, {(user.name || 'there').split(' ')[0]}</PageTitle>

      <SectionWrap tight>
        <Container className="grid items-start gap-[clamp(24px,4vw,56px)] min-[900px]:grid-cols-[290px_minmax(0,1fr)]">
          {/* ===================== SIDEBAR ===================== */}
          <aside className={cx(cardCls, 'p-3.5 min-[900px]:sticky min-[900px]:top-[calc(var(--navbar-h,72px)+20px)] min-[900px]:p-5')}>
            <div className="flex items-center gap-3.5 border-b border-line pb-[18px]">
              <span className="inline-flex size-12 flex-none items-center justify-center rounded-full bg-espresso font-display text-[1.3rem] text-champagne" aria-hidden="true">{initial}</span>
              <div className="min-w-0">
                <p className="m-0 truncate font-bold text-espresso">{user.name}</p>
                <p className="m-0 truncate text-[0.84rem] text-muted">{user.email}</p>
              </div>
            </div>
            <nav className="mt-3 flex gap-0.5 overflow-x-auto [scrollbar-width:none] min-[900px]:my-3.5 min-[900px]:grid min-[900px]:overflow-visible [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Account sections" aria-orientation="vertical">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} type="button" role="tab" aria-selected={active} className={navBtn} onClick={() => setTab(t.key)}>
                    <Icon size={17} aria-hidden="true" /> {t.label}
                    {active && <FiChevronRight className="ml-auto text-white max-[900px]:hidden" size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </nav>
            <Link to="/contact" className="mb-2 hidden items-center gap-3 rounded-md p-3 font-medium text-ink hover:bg-cream min-[900px]:flex"><FiLifeBuoy size={17} aria-hidden="true" /> Support</Link>
            <button type="button" className="hidden w-full items-center gap-3 rounded-md border border-line bg-transparent p-3 font-medium text-muted transition hover:border-sale hover:text-sale min-[900px]:flex" onClick={handleLogout}><FiLogOut size={16} aria-hidden="true" /> Sign out</button>
          </aside>

          {/* ===================== CONTENT ===================== */}
          <div className="min-w-0" role="tabpanel">
            <div className="mb-[26px] grid gap-3.5 sm:grid-cols-3">
              {[
                [orders ? orders.length : '–', 'Total orders'],
                [orders ? orders.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.orderStatus)).length : '–', 'In progress'],
                [wishlist.length, 'Wishlist items'],
              ].map(([n, label]) => (
                <div key={label} className="flex flex-col gap-0.5 rounded-lg border border-line bg-white px-[18px] py-4">
                  <strong className="font-display text-[1.6rem] font-normal leading-tight tabular-nums text-brand">{n}</strong>
                  <span className="text-[0.82rem] text-muted">{label}</span>
                </div>
              ))}
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
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {orders.map((o) => (
                      <li key={o._id}>
                        <Link to={`/account/orders/${o._id}`} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white px-[18px] py-4 transition duration-200 hover:border-gold hover:shadow-pop">
                          <span className="inline-flex size-[46px] flex-none items-center justify-center rounded-full bg-sand text-walnut"><FiPackage size={18} aria-hidden="true" /></span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <strong className="truncate text-espresso">{o.orderNumber}</strong>
                            <span className="text-[0.84rem] text-muted">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              , {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? '' : 's'}
                            </span>
                          </span>
                          <StatusPill status={o.orderStatus} />
                          <span className="ml-auto w-24 text-right font-bold tabular-nums text-espresso sm:ml-0">{rupee(o.pricing?.grandTotal ?? 0)}</span>
                          <FiChevronRight className="hidden flex-none text-muted sm:block" aria-hidden="true" />
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
                  <div className={cx(cardCls, 'p-5 sm:p-8')}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-[18px]">
                      <div>
                        <p className="m-0 font-bold text-espresso">Order {trackingOrder.orderNumber}</p>
                        <p className="m-0 mt-0.5 text-[0.88rem] tabular-nums text-muted">{rupee(trackingOrder.pricing?.grandTotal ?? 0)}, {trackingOrder.items?.length || 0} item(s)</p>
                      </div>
                      <StatusPill status={trackingOrder.orderStatus} />
                    </div>
                    <ol className="m-0 mb-1.5 mt-8 grid list-none grid-cols-5 p-0">
                      {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(trackingOrder.orderStatus);
                        const done = i <= currentIdx;
                        return (
                          <li key={s} className={cx('relative flex flex-col items-center gap-2.5 text-center', done ? 'text-espresso' : 'text-muted', i < 4 && "after:absolute after:left-[calc(50%+22px)] after:right-[calc(-50%+22px)] after:top-4 after:h-0.5 after:content-['']", i < 4 && (done && i < currentIdx ? 'after:bg-espresso' : 'after:bg-line'))}>
                            <span className={cx('relative z-[1] inline-flex size-8 items-center justify-center rounded-full text-[0.8rem] font-semibold tabular-nums', done ? 'bg-espresso text-champagne' : 'bg-sand')}>{done ? <FiCheck size={14} aria-hidden="true" /> : i + 1}</span>
                            <span className="text-[0.68rem] font-semibold sm:text-[0.78rem]">{s}</span>
                          </li>
                        );
                      })}
                    </ol>
                    <div className="mt-6"><Button to={`/account/orders/${trackingOrder._id}`} variant="outline" size="sm">View order details</Button></div>
                  </div>
                )}
              </Section>
            )}

            {tab === 'Addresses' && (
              <Section title="Saved addresses">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {profile?.addresses?.map((a) => (
                    <div key={a._id} className="flex items-start gap-3.5 rounded-lg border border-line bg-white p-[18px]">
                      <span className="inline-flex size-10 flex-none items-center justify-center rounded-full bg-sand text-walnut"><FiMapPin size={16} aria-hidden="true" /></span>
                      <div>
                        <p className="m-0 font-bold text-espresso">{a.label || 'Address'}</p>
                        <p className="mb-2.5 mt-1 text-[0.88rem] text-muted">{[a.line1, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')}</p>
                        <button type="button" className="inline-flex items-center gap-1.5 border-0 bg-transparent text-[0.84rem] text-muted transition-colors hover:text-sale" onClick={() => deleteAddress(a._id)}><FiTrash2 size={14} aria-hidden="true" /> Remove</button>
                      </div>
                    </div>
                  ))}
                  {!addressForm && (
                    <button type="button" className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-transparent p-[18px] font-semibold text-walnut transition hover:border-espresso hover:bg-white" onClick={() => setAddressForm({ country: 'India' })}>
                      <FiPlus size={20} aria-hidden="true" /> Add new address
                    </button>
                  )}
                </div>

                {!profile?.addresses?.length && !addressForm && (
                  <p className="mt-3.5 text-muted">No saved addresses yet. Add one to speed up checkout.</p>
                )}

                {addressForm && (
                  <form onSubmit={addAddress} className={cx(cardCls, 'mt-5 p-5 sm:p-8')}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="ad-label" label="Label (e.g. Home)" value={addressForm.label} onChange={(v) => setAddressForm((f) => ({ ...f, label: v }))} />
                      <Field id="ad-phone" label="Phone" type="tel" value={addressForm.phone} onChange={(v) => setAddressForm((f) => ({ ...f, phone: v }))} />
                      <Field id="ad-line1" label="Address line 1" className="sm:col-span-2" value={addressForm.line1} onChange={(v) => setAddressForm((f) => ({ ...f, line1: v }))} required />
                      <Field id="ad-city" label="City" value={addressForm.city} onChange={(v) => setAddressForm((f) => ({ ...f, city: v }))} required />
                      <Field id="ad-state" label="State" value={addressForm.state} onChange={(v) => setAddressForm((f) => ({ ...f, state: v }))} />
                      <Field id="ad-pin" label="PIN code" value={addressForm.pincode} onChange={(v) => setAddressForm((f) => ({ ...f, pincode: v }))} required />
                      <Field id="ad-country" label="Country" value={addressForm.country || 'India'} onChange={(v) => setAddressForm((f) => ({ ...f, country: v }))} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
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
                  <ul className="m-0 grid list-none grid-cols-2 gap-[18px] p-0 sm:grid-cols-3">
                    {wishlist.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} className="flex flex-col gap-1.5">
                          <PhotoBlock tone={p.tone} ratio="4/5" rounded={8} src={resolveImageUrl(p.image)} alt={p.name} />
                          <span className="mt-1.5 font-display text-espresso">{p.name}</span>
                          {p.price != null && <span className="text-[0.92rem] font-bold tabular-nums">{rupee(p.price)}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {tab === 'Profile' && (
              <Section title="Profile details">
                <div className={cx(cardCls, 'mb-4 flex items-center gap-5 p-5 sm:p-8')}>
                  <span className="inline-flex size-[72px] flex-none items-center justify-center rounded-full bg-espresso font-display text-[1.9rem] text-champagne" aria-hidden="true">{initial}</span>
                  <div className="min-w-0">
                    <p className="m-0 truncate font-bold text-espresso">{profileForm.name || user.name || 'Add your name'}</p>
                    <p className="m-0 truncate text-[0.84rem] text-muted">{user.email}</p>
                    {profile?.createdAt && (
                      <p className="mt-1.5 text-[0.82rem] font-medium text-walnut">Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-3.5">
                  <SummaryStat label="Orders" value={orders?.length ?? '–'} />
                  <SummaryStat label="Wishlist" value={wishlist?.length ?? 0} />
                  <SummaryStat label="Addresses" value={profile?.addresses?.length ?? 0} />
                </div>

                <form onSubmit={saveProfile} className={cx(cardCls, 'p-5 sm:p-8')}>
                  <h3 className="mb-3 flex items-center gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.14em] text-walnut"><FiEdit2 size={13} aria-hidden="true" /> Edit details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <LabeledField id="pf-name" icon={FiUser} label="Full name" placeholder="Your full name" value={profileForm.name} onChange={(v) => setProfileForm((f) => ({ ...f, name: v }))} />
                    <LabeledField id="pf-phone" icon={FiPhone} label="Phone number" placeholder="10-digit mobile number" value={profileForm.phone} onChange={(v) => setProfileForm((f) => ({ ...f, phone: v }))} />
                    <LabeledField id="pf-email" className="sm:col-span-2" icon={FiMail} label="Email address" value={user.email} disabled hint="Your email is linked to your login and can't be changed here." />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3"><Button type="submit" loading={savingProfile}>{savingProfile ? 'Saving…' : 'Save changes'}</Button></div>
                </form>

                <div className="mt-4 sm:hidden">
                  <Button variant="outline" block onClick={handleLogout}><FiLogOut size={15} aria-hidden="true" /> Sign out</Button>
                </div>
              </Section>
            )}
          </div>
        </Container>
      </SectionWrap>
    </>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section>
      <div className="mb-[22px] flex items-baseline justify-between gap-3">
        <h2 className="text-[1.7rem]">{title}</h2>
        {subtitle && <span className="text-[0.88rem] text-muted">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-line bg-white px-3 py-[18px] text-center">
      <strong className="font-display text-[1.8rem] font-normal leading-tight tabular-nums text-espresso">{value}</strong>
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
    </div>
  );
}

function LabeledField({ id, icon: Icon, label, placeholder, value, onChange, className = '', required = false, disabled = false, hint }) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <span className="relative block">
        {Icon && <Icon size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-walnut" />}
        <input id={id} className={cx(inputCls, Icon && 'pl-[42px]')} placeholder={placeholder} value={value || ''} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required} disabled={disabled} />
      </span>
      {hint && <span className={hintCls}>{hint}</span>}
    </div>
  );
}

function Field({ id, label, value, onChange, className = '', required = false, type = 'text' }) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <label className={labelCls} htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input id={id} type={type} className={inputCls} value={value || ''} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required} />
    </div>
  );
}
