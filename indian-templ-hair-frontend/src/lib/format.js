// Store currency: US dollars everywhere (catalogue, cart, checkout, orders). PayPal charges the same USD amount.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (n) => usd.format(Number(n) || 0);
export const CURRENCY = 'USD';
