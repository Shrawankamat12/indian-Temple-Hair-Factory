import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiLock, FiTruck, FiRefreshCw, FiTag, FiArrowLeft } from 'react-icons/fi';
import ProductCarousel from '../components/ProductCarousel';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { EmptyState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { useProducts, useCompanyInfo } from '../hooks/useStoreData';
import { money } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import Container from '../components/Container';
import Section from '../components/Section';
import PageTitle from '../components/PageTitle';
import { SummaryCard, SummaryRows, SummaryTotal } from '../components/SummaryCard';
import { FormAlert } from '../components/Field';
import { cx, linkU } from '../lib/ui';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal, cartMrpTotal, appliedCoupon, applyCoupon, clearCoupon, showError } = useStore();
  const [coupon, setCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();
  const { company } = useCompanyInfo();
  // Same figures the server uses (Admin → Settings → Shipping). Previously Cart showed 15, Checkout 15 and the order service 499.
  const FREE_SHIPPING_OVER = company.shipping.freeShippingThreshold;
  const { products: suggestions } = useProducts({ limit: 12 });
  const alsoLike = suggestions.filter((p) => !cart.some((c) => c.id === p.id)).slice(0, 8);

  const discount = cartMrpTotal - cartSubtotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const shipping = cart.length === 0 ? 0 : (FREE_SHIPPING_OVER > 0 && cartSubtotal > FREE_SHIPPING_OVER ? 0 : company.shipping.standardRate);
  const total = Math.max(0, cartSubtotal - couponDiscount) + shipping;
  const toFree = FREE_SHIPPING_OVER > 0 ? Math.max(0, FREE_SHIPPING_OVER - cartSubtotal) : 0;

  async function handleApply() {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(coupon.trim(), cartSubtotal);
    } catch (err) {
      clearCoupon();
      showError(err, 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  }

  const freePct = Math.min(100, FREE_SHIPPING_OVER > 0 ? Math.round((cartSubtotal / FREE_SHIPPING_OVER) * 100) : 0);

  return (
    <>
      <PageTitle count={`(${cart.length} item${cart.length !== 1 ? 's' : ''})`}>Your Cart</PageTitle>

      <Section tight>
        <Container>
          {cart.length === 0 ? (
            <EmptyState
              icon={<FiShoppingBag size={26} />}
              title="Your cart is waiting"
              message="Time to add some factory-direct hair to it."
              action={<Button to="/shop">Start shopping</Button>}
            />
          ) : (
            <div className="grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_390px]">
              {/* ===================== CART ITEMS ===================== */}
              <div>
                {/* free-shipping progress */}
                <div className="mb-5 rounded-lg border border-line bg-white px-5 py-4">
                  <p className="m-0 flex items-center gap-2 text-[0.88rem] text-espresso">
                    <FiTruck size={16} className="text-gold" aria-hidden="true" />
                    {toFree > 0 ? <>Add <strong className="tabular-nums">{money(toFree)}</strong> more for free shipping.</> : <strong className="text-ok">You've unlocked free shipping!</strong>}
                  </p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={freePct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-brand transition-[width] duration-500" style={{ width: `${freePct}%` }} />
                  </div>
                </div>

                <ul className="m-0 list-none border-t border-espresso p-0">
                  {cart.map((item) => (
                    <li key={item.id} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4 border-b border-line py-6 sm:grid-cols-[118px_minmax(0,1fr)_auto] sm:gap-[22px]">
                      <Link to={`/product/${item.id}`} className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md bg-sand text-walnut" aria-label={item.name}>
                        {item.image ? (
                          <img className="size-full object-cover" src={resolveImageUrl(item.image)} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <FiShoppingBag size={26} />
                        )}
                      </Link>

                      <div className="min-w-0">
                        <h3 className="mb-2 text-[1.2rem]"><Link to={`/product/${item.id}`} className="hover:text-walnut">{item.name}</Link></h3>
                        <p className="m-0 mb-[18px] flex flex-wrap gap-x-4 gap-y-1 text-[0.86rem] text-muted">
                          {item.hairType && <span>{item.hairType}</span>}
                          {item.texture && item.texture !== item.hairType && <span>{item.texture}</span>}
                          {item.laceType && <span>{item.laceType}</span>}
                          {item.length && <span>Length {item.length}"</span>}
                          {item.color && <span>{item.color}</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3.5">
                          <div className="inline-flex items-center rounded-md border border-line-strong bg-white" role="group" aria-label={`Quantity for ${item.name}`}>
                            <button type="button" className="inline-flex h-9 w-[34px] items-center justify-center text-espresso transition-colors hover:bg-sand" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity"><FiMinus size={14} /></button>
                            <span className="min-w-10 text-center font-semibold tabular-nums" aria-live="polite">{item.qty}</span>
                            <button type="button" className="inline-flex h-9 w-[34px] items-center justify-center text-espresso transition-colors hover:bg-sand" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity"><FiPlus size={14} /></button>
                          </div>
                          <button type="button" className="inline-flex items-center gap-1.5 border-0 bg-transparent text-[0.84rem] text-muted transition-colors hover:text-sale" onClick={() => removeFromCart(item.id)}>
                            <FiTrash2 size={14} aria-hidden="true" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="col-start-2 flex items-baseline gap-2.5 tabular-nums sm:col-start-auto sm:flex-col sm:items-end sm:gap-0.5 sm:text-right">
                        <strong className="text-[1.1rem] text-espresso">{money(item.price * item.qty)}</strong>
                        {item.mrp > item.price && <s className="text-[0.84rem] text-muted">{money(item.mrp * item.qty)}</s>}
                      </div>
                    </li>
                  ))}
                </ul>

                <Link to="/shop" className="mt-[26px] inline-flex items-center gap-2 text-[0.9rem] font-semibold text-walnut hover:text-espresso"><FiArrowLeft size={15} aria-hidden="true" /> Continue shopping</Link>
              </div>

              {/* ===================== ORDER SUMMARY ===================== */}
              <SummaryCard title="Order Summary" aria-label="Order summary">
                <p className="mb-2 text-[0.8rem] font-semibold text-espresso">Have a coupon?</p>
                <div className="flex items-center gap-2 rounded-md border border-line-strong bg-cream py-[5px] pl-3.5 pr-[5px] text-walnut transition focus-within:border-walnut focus-within:ring-4 focus-within:ring-gold/30">
                  <label htmlFor="coupon" className="sr-only">Coupon code</label>
                  <FiTag size={16} aria-hidden="true" />
                  <input id="coupon" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} autoComplete="off" className="min-w-0 flex-1 border-0 bg-transparent py-2 text-ink outline-none" />
                  <Button variant="dark" size="sm" onClick={handleApply} disabled={applying}>{applying ? 'Checking…' : 'Apply'}</Button>
                </div>

                {appliedCoupon && (
                  <FormAlert kind="ok" className="mt-3 flex items-center justify-between gap-2.5">
                    <span>{appliedCoupon.code} applied, you save {money(appliedCoupon.discount)}</span>
                    <button type="button" className={cx(linkU, 'border-0 bg-transparent')} onClick={() => { clearCoupon(); setCoupon(''); }}>Remove</button>
                  </FormAlert>
                )}

                <SummaryRows className="mt-5 border-t border-line pt-[18px]" rows={[
                  { label: 'Subtotal', value: money(cartSubtotal) },
                  discount > 0 && { label: 'Discount on MRP', value: `−${money(discount)}`, save: true },
                  appliedCoupon && { label: `Coupon (${appliedCoupon.code})`, value: `−${money(couponDiscount)}`, save: true },
                  { label: 'Shipping', value: shipping === 0 ? 'Free' : money(shipping) },
                ]} />

                {toFree > 0 && <p className="mt-3.5 rounded-md bg-gold-soft px-3 py-2.5 text-[0.84rem] text-espresso">Add {money(toFree)} more for free shipping.</p>}

                <SummaryTotal>{money(total)}</SummaryTotal>

                <Button size="lg" block onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>

                <ul className="m-0 mt-[22px] grid list-none grid-cols-3 gap-2 border-t border-line p-0 pt-[18px] text-center">
                  {[
                    [FiLock, 'Secure', 'checkout'],
                    company.shipping.deliveryMaxDays > 0 && [FiTruck, `${company.shipping.deliveryMinDays}–${company.shipping.deliveryMaxDays} days`, 'delivery'],
                    company.policy.returns && [FiRefreshCw, 'Returns', 'accepted'],
                  ].filter(Boolean).map(([Icon, a, b]) => (
                    <li key={a} className="flex flex-col items-center gap-1.5 text-[0.74rem] leading-snug text-muted">
                      <Icon size={16} className="text-gold" aria-hidden="true" /><span>{a}<br />{b}</span>
                    </li>
                  ))}
                </ul>
              </SummaryCard>
            </div>
          )}
        </Container>
      </Section>

      {alsoLike.length > 0 && (
        <Section tight>
          <Container>
            <SectionHeading title="You may also like" />
            <ProductCarousel products={alsoLike} label="You may also like" />
          </Container>
        </Section>
      )}
    </>
  );
}
