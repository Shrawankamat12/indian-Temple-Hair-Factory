import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiLock, FiTruck, FiRefreshCw, FiTag, FiArrowLeft } from 'react-icons/fi';
import ProductCarousel from '../components/ProductCarousel';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { EmptyState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { useProducts } from '../hooks/useStoreData';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';

const FREE_SHIPPING_OVER = 15000;

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal, cartMrpTotal, appliedCoupon, applyCoupon, clearCoupon, showError } = useStore();
  const [coupon, setCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();
  const { products: suggestions } = useProducts({ limit: 12 });
  const alsoLike = suggestions.filter((p) => !cart.some((c) => c.id === p.id)).slice(0, 8);

  const discount = cartMrpTotal - cartSubtotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const shipping = cart.length === 0 ? 0 : (cartSubtotal > FREE_SHIPPING_OVER ? 0 : 15);
  const total = Math.max(0, cartSubtotal - couponDiscount) + shipping;
  const toFree = Math.max(0, FREE_SHIPPING_OVER - cartSubtotal);

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

  return (
    <>
      <div className="container page-title-row">
        <h1 className="page-title">Your Cart <small>({cart.length} item{cart.length !== 1 ? 's' : ''})</small></h1>
      </div>

      <div className="section section--tight">
        <div className="container">
          {cart.length === 0 ? (
            <EmptyState
              icon={<FiShoppingBag size={26} />}
              title="Your cart is waiting"
              message="Time to add some factory-direct hair to it."
              action={<Button to="/shop">Start shopping</Button>}
            />
          ) : (
            <div className="cart-grid">
              {/* ===================== CART ITEMS ===================== */}
              <div>
                <ul className="cart-list">
                  {cart.map((item) => (
                    <li key={item.id} className="cart-item">
                      <Link to={`/product/${item.id}`} className="cart-thumb" aria-label={item.name}>
                        {item.image ? (
                          <img src={resolveImageUrl(item.image)} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <FiShoppingBag size={26} />
                        )}
                      </Link>

                      <div className="cart-info">
                        <h3><Link to={`/product/${item.id}`}>{item.name}</Link></h3>
                        <p className="cart-meta">
                          {item.hairType && <span>{item.hairType}</span>}
                          {item.texture && item.texture !== item.hairType && <span>{item.texture}</span>}
                          {item.laceType && <span>{item.laceType}</span>}
                          {item.length && <span>Length {item.length}"</span>}
                          {item.color && <span>{item.color}</span>}
                        </p>
                        <div className="cart-controls">
                          <div className="qty qty--sm" role="group" aria-label={`Quantity for ${item.name}`}>
                            <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity"><FiMinus size={14} /></button>
                            <span className="qty-n" aria-live="polite">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity"><FiPlus size={14} /></button>
                          </div>
                          <button type="button" className="cart-remove" onClick={() => removeFromCart(item.id)}>
                            <FiTrash2 size={14} aria-hidden="true" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-line price">
                        <strong>{rupee(item.price * item.qty)}</strong>
                        {item.mrp > item.price && <s>{rupee(item.mrp * item.qty)}</s>}
                      </div>
                    </li>
                  ))}
                </ul>

                <Link to="/shop" className="cart-continue"><FiArrowLeft size={15} aria-hidden="true" /> Continue shopping</Link>
              </div>

              {/* ===================== ORDER SUMMARY ===================== */}
              <aside className="summary" aria-label="Order summary">
                <h2>Order Summary</h2>

                <p className="coupon-label">Have a coupon?</p>
                <div className="coupon">
                  <label htmlFor="coupon" className="sr-only">Coupon code</label>
                  <FiTag size={16} aria-hidden="true" />
                  <input id="coupon" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} autoComplete="off" />
                  <button type="button" className="btn btn-dark btn-sm" onClick={handleApply} disabled={applying}>{applying ? 'Checking…' : 'Apply'}</button>
                </div>

                {appliedCoupon && (
                  <p className="form-alert form-alert-ok coupon-ok">
                    <span>{appliedCoupon.code} applied, you save {rupee(appliedCoupon.discount)}</span>
                    <button type="button" className="link-u" onClick={() => { clearCoupon(); setCoupon(''); }}>Remove</button>
                  </p>
                )}

                <dl className="sum-rows price">
                  <div><dt>Subtotal</dt><dd>{rupee(cartSubtotal)}</dd></div>
                  {discount > 0 && <div className="is-save"><dt>Discount on MRP</dt><dd>−{rupee(discount)}</dd></div>}
                  {appliedCoupon && <div className="is-save"><dt>Coupon ({appliedCoupon.code})</dt><dd>−{rupee(couponDiscount)}</dd></div>}
                  <div><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : rupee(shipping)}</dd></div>
                </dl>

                {toFree > 0 && <p className="sum-hint">Add {rupee(toFree)} more for free shipping.</p>}

                <div className="sum-total price">
                  <span>Total</span>
                  <strong>{rupee(total)}</strong>
                </div>

                <Button size="lg" block onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>

                <ul className="sum-trust">
                  <li><FiLock size={16} aria-hidden="true" /><span>Secure<br />checkout</span></li>
                  <li><FiTruck size={16} aria-hidden="true" /><span>24 hrs<br />from Delhi</span></li>
                  <li><FiRefreshCw size={16} aria-hidden="true" /><span>7-day<br />returns</span></li>
                </ul>
              </aside>
            </div>
          )}
        </div>
      </div>

      {alsoLike.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <SectionHeading title="You may also like" />
            <ProductCarousel products={alsoLike} label="You may also like" />
          </div>
        </section>
      )}
    </>
  );
}
