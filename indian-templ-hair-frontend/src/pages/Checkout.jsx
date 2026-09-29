import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiSmartphone,
  FiPackage,
  FiLock,
  FiMapPin,
  FiChevronRight,
  FiGlobe,
  FiBriefcase,
} from 'react-icons/fi';

import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { ordersApi, paymentsApi } from '../lib/resources';
import { openRazorpayCheckout } from '../lib/razorpay';
import { resolveImageUrl } from '../lib/api';
import { useCompanyInfo } from '../hooks/useStoreData';

const STEPS = [
  {
    label: 'Shipping Address',
    icon: FiMapPin,
  },
  {
    label: 'Delivery Options',
    icon: FiTruck,
  },
  {
    label: 'Payment',
    icon: FiCreditCard,
  },
  {
    label: 'Review',
    icon: FiPackage,
  },
];

/*
 * Payment options shown on YOUR checkout page.
 *
 * Razorpay will show the actual payment UI after
 * the customer clicks "Place Order".
 *
 * COD is handled by our store and does not use Razorpay.
 */
const PAYMENT_OPTIONS = [
  {
    id: 'card',
    title: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay, Amex accepted',
    icon: FiCreditCard,
  },
  {
    id: 'upi',
    title: 'UPI',
    sub: 'Google Pay, PhonePe, Paytm, BHIM & more',
    icon: FiSmartphone,
  },
  {
    id: 'netbanking',
    title: 'Netbanking',
    sub: 'All major Indian banks supported',
    icon: FiGlobe,
  },
  {
    id: 'wallet',
    title: 'Wallets',
    sub: 'Available wallets shown by Razorpay',
    icon: FiBriefcase,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    icon: FiPackage,
  },
];

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function Checkout() {
  const {
    cart,
    cartSubtotal,
    cartMrpTotal,
    user,
    appliedCoupon,
    clearCart,
    clearCoupon,
    showError,
  } = useStore();
  const { company } = useCompanyInfo();

  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [address, setAddress] = useState(emptyAddress);

  const [shipMethod, setShipMethod] = useState('standard');

  const [payMethod, setPayMethod] = useState('card');

  const [placing, setPlacing] = useState(false);

  const [formError, setFormError] = useState('');

  // UI only: after a failed "Continue" on the address step, flag empty required fields.
  const [attempted, setAttempted] = useState(false);

  const [selectedSavedId, setSelectedSavedId] = useState(null);

  const [showNewForm, setShowNewForm] = useState(false);

  /*
   * Saved addresses
   */
  const savedAddresses = user?.addresses?.length
    ? user.addresses
    : user?.address
    ? [{ id: 'default', ...user.address }]
    : [];

  /*
   * Automatically select saved address.
   */
  useEffect(() => {
    if (savedAddresses.length === 1) {
      applySavedAddress(savedAddresses[0]);
    } else if (savedAddresses.length === 0) {
      setShowNewForm(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /*
   * Apply saved address.
   */
  function applySavedAddress(saved) {
    setAddress({
      fullName: saved.fullName || user?.name || '',
      phone: saved.phone || '',
      email: saved.email || user?.email || '',
      line1: saved.line1 || saved.address1 || '',
      city: saved.city || '',
      state: saved.state || '',
      pincode: saved.pincode || saved.zip || '',
      country: saved.country || 'India',
    });

    setSelectedSavedId(saved.id || saved._id || 'default');

    setShowNewForm(false);

    setFormError('');
  }

  /*
   * Shipping calculation.
   */
  const shippingCost =
    shipMethod === 'express'
      ? 999
      : cartSubtotal > 15000
      ? 0
      : 15;

  /*
   * Coupon discount.
   */
  const discountAmount = appliedCoupon?.discount || 0;

  /*
   * Final payable amount.
   */
  const total =
    Math.max(0, cartSubtotal - discountAmount) + shippingCost;

  /*
   * Update address field.
   */
  function updateField(field, value) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * Validate address.
   */
  function addressValid() {
    return Boolean(
      address.fullName &&
        address.phone &&
        address.line1 &&
        address.city &&
        address.pincode
    );
  }

  /*
   * Create order + Razorpay payment.
   */
  async function placeOrder() {
    if (placing) return;

    setPlacing(true);
    setFormError('');

    try {
      /*
       * Create our own store order first.
       */
      const res = await ordersApi.create({
        customerName: address.fullName,

        customerEmail: address.email,

        customerPhone: address.phone,

        items: cart.map((item) => {
          const unitPrice =
            item.mrp && item.mrp > item.price
              ? item.mrp
              : item.price;

          const discountPerUnit = unitPrice - item.price;

          return {
            productId: item.id,

            productName: item.name,

            sku: item.sku || item.id,

            image: item.image,

            variant: {
              length: item.length
                ? `${item.length} inch`
                : undefined,

              colour: item.color || undefined,

              texture: item.hairType || undefined,
            },

            quantity: item.qty,

            unitPrice,

            discount: discountPerUnit * item.qty,

            finalPrice: item.price,

            total: item.price * item.qty,
          };
        }),

        billingAddress: {
          ...address,
          line2: address.line2 || '',
          landmark: address.landmark || '',
        },

        shippingAddress: {
          ...address,
          line2: address.line2 || '',
          landmark: address.landmark || '',
        },

        pricing: {
          subtotal: cartMrpTotal,

          productDiscount:
            cartMrpTotal - cartSubtotal,

          couponDiscount: discountAmount,

          shippingCharge: shippingCost,

          tax: 0,

          grandTotal: total,
        },

        payment: {
          method: payMethod,
        },

        shipping: {
          method: shipMethod,
        },

        couponCode: appliedCoupon?.code,
      });

      const order = res.data;

      /*
       * COD
       *
       * No Razorpay payment required.
       */
      if (payMethod === 'cod') {
        clearCart();

        clearCoupon();

        navigate('/order-confirmation', {
          state: {
            orderNumber: order.orderNumber,
          },
        });

        return;
      }

      /*
       * ONLINE PAYMENT
       *
       * First check Razorpay configuration.
       */
      const { data: status } = await paymentsApi.status();

      if (!status.configured) {
        throw new Error(
          'Online payment is not configured yet. Please choose Cash on Delivery.'
        );
      }

      /*
       * Create Razorpay order from backend.
       */
      const { data: rp } =
        await paymentsApi.createOrder(order._id);

      /*
       * Open Razorpay Checkout.
       */
      const result = await openRazorpayCheckout({
        keyId: rp.keyId,

        amount: rp.amount,

        currency: rp.currency,

        razorpayOrderId: rp.razorpayOrderId,

        orderNumber: rp.orderNumber,

        storeName: company.brandName,

        name: address.fullName,

        email: address.email,

        contact: address.phone,

        /*
         * Selected payment category from our checkout.
         *
         * Example:
         * card
         * upi
         * netbanking
         * wallet
         */
        method: payMethod,
      });

      /*
       * Verify payment on backend.
       */
      await paymentsApi.verify({
        orderId: order._id,

        razorpayOrderId:
          result.razorpayOrderId,

        razorpayPaymentId:
          result.razorpayPaymentId,

        razorpaySignature:
          result.razorpaySignature,
      });

      /*
       * Payment successful.
       */
      clearCart();

      clearCoupon();

      navigate('/order-confirmation', {
        state: {
          orderNumber: order.orderNumber,
        },
      });
    } catch (err) {
      console.error(
        'Place order failed:',
        err
      );

      showError(
        err,
        'Could not place your order — please try again'
      );

      setFormError(
        err?.message ||
          'Could not place your order'
      );
    } finally {
      setPlacing(false);
    }
  }

  /*
   * Continue / Place Order button.
   */
  function next() {
    /*
     * Address validation.
     */
    if (step === 0 && !addressValid()) {
      setAttempted(true);
      setFormError(
        'Please fill in name, phone, address, city and pincode.'
      );

      return;
    }

    /*
     * Payment validation.
     */
    if (step === 2 && !payMethod) {
      setFormError(
        'Please select a payment method.'
      );

      return;
    }

    setFormError('');

    /*
     * Last step = place order.
     */
    if (step === STEPS.length - 1) {
      placeOrder();

      return;
    }

    setStep((current) => current + 1);
  }

  /*
   * Back button.
   */
  function previous() {
    if (placing) return;

    setFormError('');

    setStep((current) =>
      Math.max(0, current - 1)
    );
  }

  const stepTitle = ['Delivery address', 'Shipping method', 'Payment method', 'Review your order'][step];
  const ship = shipMethod === 'express' ? 'Express' : 'Standard';
  const req = (key) => attempted && step === 0 && !address[key];

  return (
    <>
      <div className="container page-title-row"><h1 className="page-title">Checkout</h1></div>

      <div className="section section--tight">
        <div className="container co-grid">
          <div className="co-main">
            {/* ---------- step indicator ---------- */}
            <ol className="steps" aria-label="Checkout progress">
              {STEPS.map((s, i) => (
                <li key={s.label} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
                  <span className="steps-dot num">{i < step ? <FiCheck size={14} aria-hidden="true" /> : i + 1}</span>
                  <span className="steps-label">{s.label}</span>
                </li>
              ))}
            </ol>

            <section className="co-card" aria-labelledby="co-title">
              <h2 id="co-title" className="co-title">{stepTitle}</h2>

              {/* ================= STEP 0: ADDRESS ================= */}
              {step === 0 && (
                <div className="co-body">
                  {!user && (
                    <div className="seg" role="group" aria-label="Checkout type">
                      <button type="button" className="is-on" aria-pressed="true">Guest checkout</button>
                      <button type="button" aria-pressed="false" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>Sign in instead</button>
                    </div>
                  )}

                  {savedAddresses.length > 0 && (
                    <div className="co-saved">
                      <h3 className="co-sub">Saved address{savedAddresses.length > 1 ? 'es' : ''}</h3>
                      <div className="co-options" role="radiogroup" aria-label="Saved addresses">
                        {savedAddresses.map((saved) => {
                          const id = saved.id || saved._id || 'default';
                          const isSelected = selectedSavedId === id && !showNewForm;
                          return (
                            <button key={id} type="button" role="radio" aria-checked={isSelected} className={`opt ${isSelected ? 'is-on' : ''}`} onClick={() => applySavedAddress(saved)}>
                              <span className="opt-icon"><FiMapPin size={16} aria-hidden="true" /></span>
                              <span className="opt-text">
                                <strong>{saved.fullName || user?.name || 'Saved address'}</strong>
                                <span>{saved.line1 || saved.address1}, {saved.city} {saved.pincode || saved.zip}</span>
                              </span>
                              {isSelected && <FiCheck size={16} className="opt-check" aria-hidden="true" />}
                            </button>
                          );
                        })}
                        <button
                          type="button" className={`opt opt-new ${showNewForm ? 'is-on' : ''}`}
                          onClick={() => { setShowNewForm(true); setSelectedSavedId(null); setAddress(emptyAddress); setFormError(''); }}
                        >
                          <span className="opt-text"><strong>Use a new address</strong></span>
                          <FiChevronRight size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {showNewForm && (
                    <div className="form-grid">
                      <Field id="co-name" label="Full name" required autoComplete="name" value={address.fullName} invalid={req('fullName')} onChange={(v) => updateField('fullName', v)} />
                      <Field id="co-phone" label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" value={address.phone} invalid={req('phone')} onChange={(v) => updateField('phone', v)} />
                      <Field id="co-email" label="Email address" type="email" autoComplete="email" className="span-2" value={address.email} onChange={(v) => updateField('email', v)} />
                      <Field id="co-line1" label="Address" required autoComplete="address-line1" className="span-2" value={address.line1} invalid={req('line1')} onChange={(v) => updateField('line1', v)} />
                      <Field id="co-city" label="City" required autoComplete="address-level2" value={address.city} invalid={req('city')} onChange={(v) => updateField('city', v)} />
                      <Field id="co-state" label="State" autoComplete="address-level1" value={address.state} onChange={(v) => updateField('state', v)} />
                      <Field id="co-pin" label="PIN code" required inputMode="numeric" autoComplete="postal-code" value={address.pincode} invalid={req('pincode')} onChange={(v) => updateField('pincode', v)} />
                      <Field id="co-country" label="Country" autoComplete="country-name" value={address.country} onChange={(v) => updateField('country', v)} />
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 1: SHIPPING ================= */}
              {step === 1 && (
                <div className="co-body co-options" role="radiogroup" aria-label="Shipping method">
                  <RadioCard
                    active={shipMethod === 'standard'} onClick={() => setShipMethod('standard')}
                    title="Standard shipping"
                    sub={`3–6 business days · ${cartSubtotal > 15000 ? 'Free' : rupee(499)}`}
                    icon={FiTruck}
                  />
                  <RadioCard
                    active={shipMethod === 'express'} onClick={() => setShipMethod('express')}
                    title="Express shipping"
                    sub={`1–2 business days · ${rupee(999)}`}
                    icon={FiPackage}
                  />
                </div>
              )}

              {/* ================= STEP 2: PAYMENT ================= */}
              {step === 2 && (
                <div className="co-body">
                  <div className="co-options" role="radiogroup" aria-label="Payment method">
                    {PAYMENT_OPTIONS.map((option) => (
                      <RadioCard key={option.id} active={payMethod === option.id} onClick={() => setPayMethod(option.id)} title={option.title} sub={option.sub} icon={option.icon} />
                    ))}
                  </div>
                  {payMethod !== 'cod' && (
                    <p className="co-note">
                      <FiLock size={16} aria-hidden="true" />
                      <span>You will be securely redirected to Razorpay Checkout to complete your payment. Card, UPI, Netbanking and other methods shown there depend on your Razorpay account and customer's availability.</span>
                    </p>
                  )}
                  {payMethod === 'cod' && (
                    <p className="co-note">
                      <FiPackage size={16} aria-hidden="true" />
                      <span>Pay in cash when your order is delivered.</span>
                    </p>
                  )}
                </div>
              )}

              {/* ================= STEP 3: REVIEW ================= */}
              {step === 3 && (
                <div className="co-body">
                  <ul className="rev-items">
                    {cart.map((item) => (
                      <li key={item.id}>
                        <span>{item.name} × {item.qty}</span>
                        <span className="price">{rupee(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="rev-rows price">
                    <div><dt>Subtotal</dt><dd>{rupee(cartSubtotal)}</dd></div>
                    {appliedCoupon && <div className="is-save"><dt>Coupon ({appliedCoupon.code})</dt><dd>−{rupee(discountAmount)}</dd></div>}
                    <div><dt>Shipping ({ship})</dt><dd>{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</dd></div>
                    <div><dt>Payment method</dt><dd>{PAYMENT_OPTIONS.find((option) => option.id === payMethod)?.title || payMethod}</dd></div>
                    <div><dt>Deliver to</dt><dd>{address.fullName}, {address.city} {address.pincode}</dd></div>
                    <div className="rev-total"><dt>Total</dt><dd>{rupee(total)}</dd></div>
                  </dl>
                </div>
              )}
            </section>

            {formError && <p className="form-alert form-alert-error co-error" role="alert">{formError}</p>}

            <div className="co-nav">
              {step > 0 ? <Button variant="outline" onClick={previous} disabled={placing}>Back</Button> : <span />}
              <Button size="lg" onClick={next} loading={placing} disabled={placing || cart.length === 0}>
                {placing ? 'Processing…' : step === STEPS.length - 1 ? (payMethod === 'cod' ? 'Place order' : 'Proceed to payment') : step === 1 ? 'Continue to Payment' : 'Continue'}
              </Button>
            </div>
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <aside className="summary co-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <ul className="co-lines">
              {cart.map((item) => (
                <li key={item.id}>
                  <span className="co-thumb">
                    {item.image ? <img src={resolveImageUrl(item.image)} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
                    <span className="co-qty num">{item.qty}</span>
                  </span>
                  <span className="co-line-name">{item.name}</span>
                  <span className="price co-line-price">{rupee(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="sum-rows price">
              <div><dt>Subtotal</dt><dd>{rupee(cartSubtotal)}</dd></div>
              {appliedCoupon && <div className="is-save"><dt>Coupon ({appliedCoupon.code})</dt><dd>−{rupee(discountAmount)}</dd></div>}
              <div><dt>Shipping</dt><dd>{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</dd></div>
            </dl>
            <div className="sum-total price"><span>Total</span><strong>{rupee(total)}</strong></div>
            <p className="co-secure"><FiLock size={14} aria-hidden="true" /> Secure checkout</p>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ---------- form field with visible label ---------- */
function Field({ id, label, value, onChange, className = '', required = false, invalid = false, type = 'text', inputMode, autoComplete }) {
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input
        id={id} type={type} inputMode={inputMode} autoComplete={autoComplete} className="input"
        value={value} required={required} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid && <span id={`${id}-err`} className="field-error">This field is required.</span>}
    </div>
  );
}

/* ---------- selectable option card ---------- */
function RadioCard({ active, onClick, title, sub, icon: Icon }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className={`opt ${active ? 'is-on' : ''}`}>
      <span className="opt-icon"><Icon size={17} aria-hidden="true" /></span>
      <span className="opt-text"><strong>{title}</strong><span>{sub}</span></span>
      {active && <FiCheck size={16} className="opt-check" aria-hidden="true" />}
    </button>
  );
}
