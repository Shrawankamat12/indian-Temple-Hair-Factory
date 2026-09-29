# Indian Temple Remy Hair Exports — Frontend Redesign

Complete visual redesign to a premium brown + gold + cream identity.
All business logic, API calls, auth, cart, checkout, wishlist and routing
are unchanged from the original — this is a UI/UX layer replacement, not a
rebuild.

## How to run
This zip does not include `node_modules` (kept small on purpose).

```
npm install
npm run dev      # local dev server
npm run build    # production build (verified: 0 errors)
```

Note: `package.json`'s `build` script still runs
`npm --prefix ../bir-hair-admin ...` to pull in your separate admin panel
before building. That's unrelated to branding and I left it as-is since I
can't verify your deploy setup — if that sibling folder isn't present,
`vite build` alone (as shown above) works fine on its own.

## What changed

### Design system
- New palette: espresso/chocolate browns, cream/white surfaces, gold used
  only as an accent (buttons, borders, hover states) — never as a body
  background, per your brief.
- Typography: Marcellus (display/headings) + Figtree (body/prices). Prices
  use Figtree because Marcellus has no ₹ glyph.
- One signature shape used sparingly: an arch-topped image frame (hero,
  category tiles, auth page).
- All new shared components: Navbar (live mega menu + search + mobile
  drawer), Footer, ProductCard, ProductGrid/Carousel, FilterPanel, Quick
  View, Compare tray, Breadcrumb/PageHeader, buttons, badges, form fields,
  skeleton/empty/error states, toasts.

### Every page redesigned
Home, Shop (with filter drawer + sidebar), Product Detail, Cart, Checkout
(4-step flow), Login/Register/Forgot/Reset, Account (orders, tracking,
addresses, wishlist, profile), Wishlist, Search, About, Factory, Journal
(list + detail), FAQ, Wholesale, Contact, Policy pages, Order Confirmation,
404.

### Behavior preserved
Every store call (`addToCart`, `toggleWishlist`, `applyCoupon`,
`placeOrder`, review submission, address CRUD, etc.), every route, every
hook (`useProducts`, `useCategories`, `useStoreData`, `useRecentlyViewed`,
`CompareContext`, ...) is used exactly as before. `Checkout.jsx`'s pricing,
validation and order-placement logic is untouched — only its JSX changed.

### Small fixes made along the way
- Removed a stray literal ` ```jsx ` that was rendering as visible text in
  the old Reviews tab.
- Home testimonials now read `quote` (the field your API actually
  returns) instead of `message`/`text`, so quotes render instead of
  showing blank.
- Search submits via client-side navigation instead of a full page
  reload, so it no longer wipes a guest's in-memory cart.
- Swapped the default browser/Vite favicon and page title for a brand
  favicon and proper `<title>`/meta description.

### Not changed (left for you to decide)
- The ₹499 vs ₹15 shipping-cost mismatch between the Shipping Policy page
  and the actual cart/checkout calculation.
- Variant colour selection still won't populate (reads `v.colour`, API
  returns `color`) and `addToCart` still doesn't pass a `variantId`.
- The bulk-discount table on the product page is still just static display
  copy — the cart doesn't apply those discounts.
- `/account/orders/:id` still has no matching route.
- Login's Google/Facebook buttons still point at `localhost:5000`.
- Unverified claims in existing content (e.g. "ISO 9001:2015 Certified
  Facility", "500+ Happy Clients") — this was pre-existing copy in
  `data/content.js` / API-driven fallback text, not something I added.

## Branding cleanup
- Removed `public/logo-full.png` (the pink "B.I.R Hair Factory India"
  logo) and 14 photos that had "B.I.R Hair Exports" signage or an
  unrelated phone number baked into the image — moved to
  `_quarantined-bir-branded-assets/` (excluded from this delivery) rather
  than deleted, in case you want to review them yourself.
- Every remaining photo import was pointed at one of the unbranded photos
  already in your `src/assets/photos` folder.
- Package name changed from `bir-hair` to `indian-temple-hair-frontend`.
- New wordmark and favicon built from your actual brand name (no
  placeholder logo was invented).

## Verification performed
- `npm run build`: succeeds, 0 errors.
- `oxlint src`: 0 errors, 7 warnings (same count and categories as your
  original codebase — nothing new introduced).
- Screenshot QA across all 21 routes at 1440px and 390px width: zero
  horizontal overflow anywhere.
- Live-tested against a mock backend: add-to-cart, cart totals/coupon,
  wishlist toggle, category mega menu, search suggestions, and the
  Login→Account redirect all work end to end.
