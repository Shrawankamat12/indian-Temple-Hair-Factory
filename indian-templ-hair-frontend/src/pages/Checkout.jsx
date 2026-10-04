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
import PayPalButtons from '../components/PayPalButtons';
import { useAsync } from '../hooks/useAsync';
import { resolveImageUrl } from '../lib/api';
import { useCompanyInfo } from '../hooks/useStoreData';
import Container from '../components/Container';
import Section from '../components/Section';
import PageTitle from '../components/PageTitle';
import { SummaryCard, SummaryRows, SummaryTotal } from '../components/SummaryCard';
import { FormAlert } from '../components/Field';
import { cx, inputCls, labelCls, errorCls } from '../lib/ui';

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
 * Payment options come from the server (Admin → Settings → Payments / Shipping):
 * PayPal only when enabled and fully configured, COD only when the admin allows it.
 */
const ALL_OPTIONS = {
  paypal: { id: 'paypal', title: 'PayPal', sub: 'Pay securely with PayPal or a debit / credit card', icon: FiCreditCard },
  cod: { id: 'cod', title: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: FiPackage },
};

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

  const { data: methodsRes, loading: methodsLoading, error: methodsError } = useAsync(() => paymentsApi.methods(), []);
  const methods = methodsRes?.data;
  const PAYMENT_OPTIONS = [methods?.paypal?.enabled && ALL_OPTIONS.paypal, methods?.cod?.enabled && ALL_OPTIONS.cod].filter(Boolean);

  const [payMethod, setPayMethod] = useState('');

  // The order exists on the server once the shopper reaches PayPal. Kept so a cancelled/failed attempt
  // retries the SAME order instead of creating duplicates.
  const [pending, setPending] = useState(null); // { orderId, orderNumber, accessToken, total }

  useEffect(() => {
    if (!payMethod && PAYMENT_OPTIONS.length) setPayMethod(PAYMENT_OPTIONS[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods]);

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
  // Display estimate only — the server recomputes shipping from Admin → Settings and its figure is final.
  const { standardRate, expressRate, freeShippingThreshold } = company.shipping;
  const shippingCost =
    shipMethod === 'express'
      ? expressRate
      : freeShippingThreshold > 0 && cartSubtotal > freeShippingThreshold
      ? 0
      : standardRate;

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

  function finish(orderNumber) {
    clearCart();
    clearCoupon();
    navigate('/order-confirmation', { state: { orderNumber, paid: payMethod === 'paypal' } });
  }

  /*
   * Create OUR order. Only ids, the chosen variant and quantities are sent — the server looks up prices,
   * stock, shipping, coupon and tax itself and returns the authoritative total.
   */
  async function placeOrder() {
    if (placing) return;
    setPlacing(true);
    setFormError('');
    try {
      const res = await ordersApi.create({
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
        items: cart.map((item) => ({
          productId: item.id,
          variantId: item.variantId || undefined,
          variantSku: item.variantSku || undefined,
          variant: {
            length: item.length ? String(item.length) : undefined,
            colour: item.color || undefined,
            laceType: item.laceType || undefined,
            density: item.density || undefined,
          },
          quantity: item.qty,
        })),
        billingAddress: { ...address, line2: address.line2 || '', landmark: address.landmark || '' },
        shippingAddress: { ...address, line2: address.line2 || '', landmark: address.landmark || '' },
        payment: { method: payMethod },
        shipping: { method: shipMethod },
        couponCode: appliedCoupon?.code,
      });
      const order = res.data;

      if (payMethod === 'cod') {
        finish(order.orderNumber);
        return;
      }
      // PayPal: show the buttons for this order; the cart is cleared only after the server confirms payment.
      setPending({ orderId: order._id, orderNumber: order.orderNumber, accessToken: order.accessToken, total: order.pricing?.grandTotal });
    } catch (err) {
      showError(err, 'Could not place your order — please try again');
      setFormError(err?.message || 'Could not place your order');
    } finally {
      setPlacing(false);
    }
  }

  function onPayPalPaid(result) {
    if (result?.paid || result?.pending) finish(result.orderNumber);
    else setFormError('Your payment is still being confirmed. Please check your account for the order status shortly.');
  }

  function onPayPalError(err) {
    setFormError(err?.message || 'The payment could not be completed. You have not been charged for an unpaid order — please try again.');
  }

  function onPayPalCancel() {
    setFormError('Payment was cancelled. Your order is saved but unpaid — press the PayPal button to try again.');
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
      <PageTitle>Checkout</PageTitle>

      <Section tight>
        <Container className="grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            {/* ---------- step indicator ---------- */}
            <ol className="m-0 mb-7 grid list-none grid-cols-4 gap-2 p-0" aria-label="Checkout progress">
              {STEPS.map((s, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <li
                    key={s.label} aria-current={current ? 'step' : undefined}
                    className={cx('flex flex-col gap-2.5 border-t-2 pt-3.5', done ? 'border-espresso text-espresso' : current ? 'border-gold text-espresso' : 'border-line text-muted')}
                  >
                    <span className={cx('inline-flex size-7 items-center justify-center rounded-full border text-[0.82rem] font-semibold tabular-nums', done ? 'border-espresso bg-espresso text-champagne' : current ? 'border-gold bg-gold text-espresso' : 'border-current')}>
                      {done ? <FiCheck size={14} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="text-[0.66rem] font-semibold tracking-[0.04em] sm:text-[0.74rem]">{s.label}</span>
                  </li>
                );
              })}
            </ol>

            <section className="rounded-xl border border-line bg-white p-[clamp(22px,3.2vw,36px)] shadow-soft" aria-labelledby="co-title">
              <h2 id="co-title" className="mb-6 text-[1.6rem]">{stepTitle}</h2>

              {/* ================= STEP 0: ADDRESS ================= */}
              {step === 0 && (
                <div className="grid gap-[22px]">
                  {!user && (
                    <div className="grid grid-cols-2 gap-1 rounded-md bg-sand p-1" role="group" aria-label="Checkout type">
                      <button type="button" className="min-h-[42px] rounded-sm bg-white text-[0.88rem] font-semibold text-espresso shadow-soft" aria-pressed="true">Guest checkout</button>
                      <button type="button" className="min-h-[42px] rounded-sm text-[0.88rem] font-semibold text-muted transition-colors hover:text-espresso" aria-pressed="false" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>Sign in instead</button>
                    </div>
                  )}

                  {savedAddresses.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-sans text-[0.72rem] font-bold uppercase tracking-[0.14em] text-walnut">Saved address{savedAddresses.length > 1 ? 'es' : ''}</h3>
                      <div className="grid gap-3" role="radiogroup" aria-label="Saved addresses">
                        {savedAddresses.map((saved) => {
                          const id = saved.id || saved._id || 'default';
                          const isSelected = selectedSavedId === id && !showNewForm;
                          return (
                            <button key={id} type="button" role="radio" aria-checked={isSelected} className={optCls(isSelected)} onClick={() => applySavedAddress(saved)}>
                              <OptIcon on={isSelected}><FiMapPin size={16} aria-hidden="true" /></OptIcon>
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <strong className="font-semibold text-espresso">{saved.fullName || user?.name || 'Saved address'}</strong>
                                <span className="text-[0.85rem] text-muted">{saved.line1 || saved.address1}, {saved.city} {saved.pincode || saved.zip}</span>
                              </span>
                              {isSelected && <FiCheck size={16} className="flex-none text-espresso" aria-hidden="true" />}
                            </button>
                          );
                        })}
                        <button
                          type="button" className={cx(optCls(showNewForm), 'justify-between border-dashed')}
                          onClick={() => { setShowNewForm(true); setSelectedSavedId(null); setAddress(emptyAddress); setFormError(''); }}
                        >
                          <span className="flex flex-1 flex-col"><strong className="font-semibold text-espresso">Use a new address</strong></span>
                          <FiChevronRight size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {showNewForm && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="co-name" label="Full name" required autoComplete="name" value={address.fullName} invalid={req('fullName')} onChange={(v) => updateField('fullName', v)} />
                      <Field id="co-phone" label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" value={address.phone} invalid={req('phone')} onChange={(v) => updateField('phone', v)} />
                      <Field id="co-email" label="Email address" type="email" autoComplete="email" className="sm:col-span-2" value={address.email} onChange={(v) => updateField('email', v)} />
                      <Field id="co-line1" label="Address" required autoComplete="address-line1" className="sm:col-span-2" value={address.line1} invalid={req('line1')} onChange={(v) => updateField('line1', v)} />
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
                <div className="grid gap-3" role="radiogroup" aria-label="Shipping method">
                  <RadioCard
                    active={shipMethod === 'standard'} onClick={() => setShipMethod('standard')}
                    title="Standard shipping"
                    sub={`${company.shipping.deliveryMinDays}–${company.shipping.deliveryMaxDays} business days · ${freeShippingThreshold > 0 && cartSubtotal > freeShippingThreshold ? 'Free' : rupee(standardRate)}`}
                    icon={FiTruck}
                  />
                  <RadioCard
                    active={shipMethod === 'express'} onClick={() => setShipMethod('express')}
                    title="Express shipping"
                    sub={`Faster delivery · ${rupee(expressRate)}`}
                    icon={FiPackage}
                  />
                </div>
              )}

              {/* ================= STEP 2: PAYMENT ================= */}
              {step === 2 && (
                <div className="grid gap-[22px]">
                  {methodsLoading && <p className="m-0 text-muted" role="status">Loading payment options…</p>}
                  {!methodsLoading && (methodsError || PAYMENT_OPTIONS.length === 0) && (
                    <FormAlert>No online payment method is available right now. Please call us on {company.phones[0]} to place your order.</FormAlert>
                  )}
                  {!methodsLoading && !methodsError && PAYMENT_OPTIONS.length > 0 && !methods?.paypal?.enabled && (
                    <p className="m-0 rounded-md border border-line bg-sand/60 px-4 py-3 text-[0.84rem] text-muted" role="note">
                      Online payment (PayPal / card) is not available at the moment, so only the methods below can be used for this order.
                    </p>
                  )}
                  <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
                    {PAYMENT_OPTIONS.map((option) => (
                      <RadioCard key={option.id} active={payMethod === option.id} onClick={() => setPayMethod(option.id)} title={option.title} sub={option.sub} icon={option.icon} />
                    ))}
                  </div>
                  <p className="m-0 flex max-w-none gap-3 rounded-md border border-line bg-cream px-4 py-3.5 text-[0.86rem] text-muted">
                    {payMethod === 'cod' ? (
                      <>
                        <FiPackage size={16} aria-hidden="true" className="mt-0.5 flex-none text-walnut" />
                        <span>Pay in cash when your order is delivered.</span>
                      </>
                    ) : (
                      <>
                        <FiLock size={16} aria-hidden="true" className="mt-0.5 flex-none text-walnut" />
                        <span>Payment is taken securely by PayPal in the final step. Your total is shown in rupees; PayPal shows the exact amount in {methods?.paypal?.currency || 'your payment currency'} before you confirm.</span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* ================= STEP 3: REVIEW ================= */}
              {step === 3 && (
                <div className="grid gap-[22px]">
                  <ul className="m-0 list-none p-0">
                    {cart.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4 border-b border-line py-3">
                        <span>{item.name}{item.length ? ` · ${item.length}"` : ''}{item.color ? ` · ${item.color}` : ''} × {item.qty}</span>
                        <span className="tabular-nums">{rupee(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <SummaryRows rows={[
                    { label: 'Subtotal', value: rupee(cartSubtotal) },
                    appliedCoupon && { label: `Coupon (${appliedCoupon.code})`, value: `−${rupee(discountAmount)}`, save: true },
                    { label: `Shipping (${ship})`, value: shippingCost === 0 ? 'Free' : rupee(shippingCost) },
                    { label: 'Payment method', value: PAYMENT_OPTIONS.find((option) => option.id === payMethod)?.title || payMethod },
                    { label: 'Deliver to', value: `${address.fullName}, ${address.city} ${address.pincode}` },
                    { label: 'Total', value: rupee(total), strong: true },
                  ]} />
                </div>
              )}
            </section>

            {formError && <FormAlert className="mt-[18px]">{formError}</FormAlert>}

            {pending && methods?.paypal?.enabled && (
              <div className="mt-[18px] grid gap-3 rounded-lg border border-line bg-white p-5">
                <p className="m-0 text-[0.9rem] text-muted">Order <strong className="text-espresso">{pending.orderNumber}</strong> is reserved for you. Total payable: <strong className="text-espresso">{rupee(pending.total)}</strong></p>
                <PayPalButtons
                  clientId={methods.paypal.clientId}
                  currency={methods.paypal.currency}
                  orderId={pending.orderId}
                  accessToken={pending.accessToken}
                  onPaid={onPayPalPaid}
                  onError={onPayPalError}
                  onCancel={onPayPalCancel}
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 0 && !pending ? <Button variant="outline" onClick={previous} disabled={placing}>Back</Button> : <span />}
              {!pending && (
                <Button size="lg" onClick={next} loading={placing} disabled={placing || cart.length === 0 || (step >= 2 && !payMethod)}>
                  {placing ? 'Processing…' : step === STEPS.length - 1 ? (payMethod === 'cod' ? 'Place order' : 'Continue to PayPal') : step === 1 ? 'Continue to Payment' : 'Continue'}
                </Button>
              )}
            </div>
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <SummaryCard title="Order summary" className="max-lg:order-first" aria-label="Order summary">
            <ul className="m-0 grid max-h-80 list-none gap-4 overflow-auto p-0">
              {cart.map((item) => (
                <li key={item.id} className="grid grid-cols-[58px_1fr_auto] items-center gap-3.5">
                  <span className="relative aspect-[4/5] w-[58px] rounded bg-sand">
                    {item.image ? <img className="size-full rounded object-cover" src={resolveImageUrl(item.image)} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-[5px] text-[0.7rem] font-semibold tabular-nums text-cream">{item.qty}</span>
                  </span>
                  <span className="text-[0.9rem] leading-snug text-ink">{item.name}</span>
                  <span className="text-[0.92rem] font-semibold tabular-nums">{rupee(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <SummaryRows className="mt-5 border-t border-line pt-[18px]" rows={[
              { label: 'Subtotal', value: rupee(cartSubtotal) },
              appliedCoupon && { label: `Coupon (${appliedCoupon.code})`, value: `−${rupee(discountAmount)}`, save: true },
              { label: 'Shipping', value: shippingCost === 0 ? 'Free' : rupee(shippingCost) },
            ]} />
            <SummaryTotal>{rupee(total)}</SummaryTotal>
            <p className="m-0 flex max-w-none items-center justify-center gap-2 text-[0.82rem] text-muted"><FiLock size={14} className="text-gold" aria-hidden="true" /> Secure checkout</p>
          </SummaryCard>
        </Container>
      </Section>
    </>
  );
}

/* ---------- form field with visible label ---------- */
function Field({ id, label, value, onChange, className = '', required = false, invalid = false, type = 'text', inputMode, autoComplete }) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <label className={labelCls} htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input
        id={id} type={type} inputMode={inputMode} autoComplete={autoComplete} className={inputCls}
        value={value} required={required} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid && <span id={`${id}-err`} className={errorCls}>This field is required.</span>}
    </div>
  );
}

const optCls = (on) => cx(
  'flex w-full items-center gap-3.5 rounded-lg border px-[18px] py-4 text-left transition',
  on ? 'border-espresso bg-cream ring-1 ring-espresso' : 'border-line-strong bg-white hover:border-walnut',
);

function OptIcon({ on, children }) {
  return (
    <span className={cx('inline-flex size-10 flex-none items-center justify-center rounded-full', on ? 'bg-espresso text-champagne' : 'bg-sand text-walnut')}>
      {children}
    </span>
  );
}

/* ---------- selectable option card ---------- */
function RadioCard({ active, onClick, title, sub, icon: Icon }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className={optCls(active)}>
      <OptIcon on={active}><Icon size={17} aria-hidden="true" /></OptIcon>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5"><strong className="font-semibold text-espresso">{title}</strong><span className="text-[0.85rem] text-muted">{sub}</span></span>
      {active && <FiCheck size={16} className="flex-none text-espresso" aria-hidden="true" />}
    </button>
  );
}
