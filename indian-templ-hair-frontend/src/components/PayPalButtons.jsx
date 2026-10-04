import { useEffect, useRef, useState } from 'react';
import { loadPayPal } from '../lib/paypal';
import { paymentsApi } from '../lib/resources';

/**
 * PayPal Smart Buttons. The browser never supplies an amount:
 *   createOrder  -> POST /payments/paypal/order   (server prices the stored order and creates the PayPal order)
 *   onApprove    -> POST /payments/paypal/capture (server captures and verifies; only then is the order Paid)
 * `onPaid(result)` is called only when the SERVER reports paid (or pending-settlement).
 */
export default function PayPalButtons({ clientId, currency, orderId, accessToken, onPaid, onError, onCancel, disabled }) {
  const ref = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | failed
  const cb = useRef({ onPaid, onError, onCancel });
  cb.current = { onPaid, onError, onCancel };

  useEffect(() => {
    let buttons;
    let dead = false;
    setState('loading');
    loadPayPal({ clientId, currency })
      .then((paypal) => {
        if (dead || !ref.current) return;
        buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' },
          createOrder: async () => {
            const res = await paymentsApi.paypalCreate(orderId, accessToken);
            return res.data.paypalOrderId;
          },
          onApprove: async (data) => {
            try {
              const res = await paymentsApi.paypalCapture(orderId, data.orderID, accessToken);
              cb.current.onPaid?.(res.data);
            } catch (err) {
              cb.current.onError?.(err);
            }
          },
          onCancel: () => cb.current.onCancel?.(),
          onError: (err) => cb.current.onError?.(err),
        });
        if (!buttons.isEligible()) { setState('failed'); return; }
        buttons.render(ref.current).then(() => !dead && setState('ready')).catch(() => !dead && setState('failed'));
      })
      .catch((err) => { if (!dead) { setState('failed'); cb.current.onError?.(err); } });
    return () => { dead = true; try { buttons?.close(); } catch { /* already closed */ } };
  }, [clientId, currency, orderId, accessToken]);

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      {state === 'loading' && <p className="m-0 text-[0.9rem] text-muted" role="status">Loading PayPal…</p>}
      {state === 'failed' && <p className="m-0 text-[0.9rem] text-red-700" role="alert">PayPal could not be loaded. Please refresh the page and try again.</p>}
      <div ref={ref} className="min-h-[48px] max-w-[420px]" />
    </div>
  );
}
