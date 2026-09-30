// Shared Tailwind class recipes. Keep pages readable: one place for the
// look of buttons, inputs, cards and headings.

export const cx = (...parts) => parts.flat(Infinity).filter(Boolean).join(' ');

/* ---------- buttons ---------- */
export const btnBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-semibold uppercase tracking-[0.1em] transition duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

export const btnVariants = {
  primary: 'bg-brand border-brand text-white hover:bg-brand-dark hover:border-brand-dark hover:shadow-[0_8px_22px_-10px_rgb(138_95_46/0.7)]',
  dark: 'bg-charcoal border-charcoal text-white hover:bg-black hover:border-black',
  outline: 'bg-transparent border-espresso text-espresso hover:bg-espresso hover:text-cream',
  gold: 'bg-transparent border-gold text-walnut hover:bg-gold hover:text-espresso',
  light: 'bg-transparent border-cream/50 text-cream hover:border-champagne hover:text-champagne',
  ghost: 'bg-transparent text-walnut hover:bg-walnut/10',
};

export const btnSizes = {
  sm: 'min-h-[38px] px-4 text-[0.72rem]',
  md: 'min-h-[46px] px-6 text-[0.78rem]',
  lg: 'min-h-[54px] px-9 text-[0.8rem]',
};

export const btn = (variant = 'primary', size = 'md', extra = '') =>
  cx(btnBase, btnVariants[variant] || btnVariants.primary, btnSizes[size] || btnSizes.md, extra);

/* ---------- form fields ---------- */
export const inputCls =
  'w-full min-h-12 rounded-md border border-line-strong bg-white px-3.5 py-3 text-ink placeholder:text-[#9a8f87] transition hover:border-walnut focus:border-walnut focus:outline-none focus:ring-4 focus:ring-gold/30 aria-[invalid=true]:border-sale aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-sale/15 disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted';
export const labelCls = 'text-[0.8rem] font-semibold text-espresso';
export const hintCls = 'text-[0.78rem] text-muted';
export const errorCls = 'text-[0.78rem] font-medium text-sale';

export const alertCls = {
  error: 'rounded-md border border-[#e4b9bf] bg-sale-soft px-3.5 py-3 text-sm text-sale',
  ok: 'rounded-md border border-[#bfd6c4] bg-ok-soft px-3.5 py-3 text-sm text-ok',
};

/* ---------- surfaces ---------- */
export const cardCls = 'rounded-xl border border-line bg-white shadow-soft';
export const cardPad = 'p-5 sm:p-7 lg:p-8';

/* ---------- small type helpers ---------- */
export const eyebrow = 'text-[0.74rem] font-bold uppercase tracking-[0.2em] text-brand';
export const eyebrowGold = 'text-[0.74rem] font-bold uppercase tracking-[0.2em] text-champagne';
export const linkU =
  'inline-block bg-gradient-to-r from-gold to-gold bg-[length:100%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 text-[0.9rem] font-semibold text-walnut transition-all duration-200 hover:bg-[length:100%_2px] hover:text-espresso';
export const iconBtn =
  'relative inline-flex size-[42px] items-center justify-center rounded-full transition hover:bg-walnut/10';
export const chip =
  'inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[0.85rem] font-medium text-ink transition hover:border-walnut aria-pressed:border-espresso aria-pressed:bg-espresso aria-pressed:text-cream';
export const price = 'font-sans tabular-nums';
export const clamp2 = 'line-clamp-2';
