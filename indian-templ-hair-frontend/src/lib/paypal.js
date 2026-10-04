// Loads the PayPal JS SDK (client-side only needs the public Client ID) and exposes window.paypal.
// Orders are created and captured by OUR backend; the SDK only shows the buttons and collects approval.
let loading = null;
let loadedKey = '';

export function loadPayPal({ clientId, currency }) {
  const key = `${clientId}|${currency}`;
  if (window.paypal && loadedKey === key) return Promise.resolve(window.paypal);
  if (loading && loadedKey === key) return loading;

  // A different client/currency than a previous load: remove the old SDK script first.
  document.querySelectorAll('script[data-paypal-sdk]').forEach((el) => el.remove());
  try { delete window.paypal; } catch { window.paypal = undefined; }

  loadedKey = key;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const qs = new URLSearchParams({ 'client-id': clientId, currency, intent: 'capture', components: 'buttons', 'disable-funding': 'credit,paylater,venmo' });
    script.src = `https://www.paypal.com/sdk/js?${qs.toString()}`;
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.onload = () => (window.paypal ? resolve(window.paypal) : reject(new Error('PayPal did not load')));
    script.onerror = () => { loading = null; loadedKey = ''; reject(new Error('Could not load PayPal. Please check your connection and try again.')); };
    document.body.appendChild(script);
  });
  return loading;
}
