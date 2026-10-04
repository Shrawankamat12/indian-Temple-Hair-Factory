import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard } from 'react-icons/fi';
import Container from '../components/Container';
import Section from '../components/Section';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { SummaryRows } from '../components/SummaryCard';
import { useStore } from '../context/StoreContext';
import { ordersApi } from '../lib/resources';
import { resolveImageUrl } from '../lib/api';
import { rupee } from '../lib/format';
import { cardCls, cx } from '../lib/ui';

/** Single order view. Route: /account/orders/:id (links from the Account → Orders list). */
export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authChecked } = useStore();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authChecked && !user) navigate('/login', { state: { from: `/account/orders/${id}` } });
  }, [authChecked, user, navigate, id]);

  useEffect(() => {
    if (!user) return;
    setOrder(null); setError(null);
    ordersApi.get(id).then((res) => setOrder(res.data)).catch(setError);
  }, [user, id]);

  if (!user) return null;
  const p = order?.pricing || {};
  const addr = order?.shippingAddress;

  return (
    <>
      <PageTitle sub={order ? `Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}` : undefined}>
        {order ? `Order ${order.orderNumber}` : 'Order details'}
      </PageTitle>
      <Section tight>
        <Container>
          <Link to="/account" className="mb-6 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-walnut hover:text-espresso"><FiArrowLeft size={15} aria-hidden="true" /> Back to my account</Link>

          {error ? (
            <ErrorState message="We could not find this order." onRetry={() => navigate(0)} />
          ) : !order ? (
            <LineSkeleton width="100%" height={240} />
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className={cx(cardCls, 'p-5 sm:p-8')}>
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-4">
                  <h2 className="text-[1.4rem]">Items</h2>
                  <StatusPill status={order.orderStatus} />
                </div>
                <ul className="m-0 grid list-none gap-4 p-0">
                  {(order.items || []).map((it, i) => (
                    <li key={`${it.productId}-${i}`} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
                      <span className="aspect-[4/5] w-16 overflow-hidden rounded bg-sand">
                        {it.image && <img src={resolveImageUrl(it.image)} alt="" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                      </span>
                      <span className="min-w-0">
                        <Link to={`/product/${it.productId}`} className="block text-[0.95rem] font-medium text-espresso hover:text-walnut">{it.productName}</Link>
                        <span className="text-[0.82rem] text-muted">
                          Qty {it.quantity}{it.variant?.length ? ` · ${it.variant.length}` : ''}{it.variant?.colour ? ` · ${it.variant.colour}` : ''}{it.variant?.texture ? ` · ${it.variant.texture}` : ''}{it.variant?.density ? ` · ${it.variant.density}` : ''}{it.variant?.laceType ? ` · ${it.variant.laceType}` : ''}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">{rupee(it.total ?? it.finalPrice * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4">
                <div className={cx(cardCls, 'p-5 sm:p-6')}>
                  <h3 className="mb-3 text-[1.15rem]">Summary</h3>
                  <SummaryRows rows={[
                    { label: 'Subtotal', value: rupee(p.subtotal ?? 0) },
                    p.tax > 0 && { label: 'Tax', value: rupee(p.tax) },
                    p.productDiscount > 0 && { label: 'Product discount', value: `−${rupee(p.productDiscount)}`, save: true },
                    p.couponDiscount > 0 && { label: 'Coupon', value: `−${rupee(p.couponDiscount)}`, save: true },
                    { label: 'Shipping', value: p.shippingCharge ? rupee(p.shippingCharge) : 'Free' },
                    { label: 'Total', value: rupee(p.grandTotal ?? 0), strong: true },
                  ]} />
                </div>
                {addr && (
                  <div className={cx(cardCls, 'p-5 sm:p-6')}>
                    <h3 className="mb-2 flex items-center gap-2 text-[1.15rem]"><FiMapPin size={16} className="text-gold" aria-hidden="true" /> Delivery address</h3>
                    <p className="m-0 text-[0.9rem] text-muted">{[addr.fullName, addr.line1, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ')}</p>
                  </div>
                )}
                <div className={cx(cardCls, 'p-5 sm:p-6')}>
                  <h3 className="mb-2 flex items-center gap-2 text-[1.15rem]"><FiCreditCard size={16} className="text-gold" aria-hidden="true" /> Payment</h3>
                  <p className="m-0 text-[0.9rem] text-muted">{order.payment?.method === 'paypal' ? 'PayPal' : order.payment?.method === 'cod' ? 'Cash on Delivery' : (order.payment?.method || '—')}{order.payment?.status ? ` · ${order.payment.status.charAt(0).toUpperCase()}${order.payment.status.slice(1)}` : ''}</p>
                  <p className="m-0 mt-1 text-[0.82rem] capitalize text-muted">Order status: {(order.orderStatus || '').replace(/_/g, ' ')}</p>
                </div>
                <Button to="/contact" variant="outline" block>Need help with this order?</Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
