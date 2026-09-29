# Storefront redesign: CHANGES

Brand name unchanged: **Indian Temple Remy Hair Exports** ("TressAura" is not used anywhere).
Cart, coupon, checkout, Razorpay, auth, wishlist, compare, search and order logic are **untouched**.
Nothing in `src/hooks/`, `src/context/`, `lib/api.js`, `lib/razorpay.js`, `lib/format.js` or
`_quarantined-bir-branded-assets/` was modified. `normalize.js` got only the allowed field additions.

## Backend
| Change | File |
|---|---|
| `Attribute`: new type `laceType`, new field `image` | `models/Attribute.js` |
| `Product`: `laceType` (+ per-variant `laceType`) | `models/Product.js` |
| `Banner.placement`: `home-mid`, `offer-card`, `seasonal-offer` | `models/Banner.js` |
| `SiteContent`: `announcements[]`, `policies[{slug,title,sections[{heading,body}]}]`, `footer.paymentMethods[]`, new `homeSections` keys | `models/SiteContent.js` |
| `Setting`: `deliveryMinDays`, `deliveryMaxDays` (delivery estimate) | `models/Setting.js` |
| **Shop filters**: `GET /products` now supports `category` (slug or id), `texture`/`hairTexture`, `hairType`, `length`, `color`/`hairColour`, `laceType`, `hairDensity`/`density` (all accept comma lists, match variants too), `price[gte|lte]`, `rating[gte]`, `search`, and `sort=price-asc|price-desc|newest|popularity|rating` (raw mongoose sorts still work). `total` is now the **filtered** count (it used to ignore filters). | `services/product.service.js` |
| Search regex input is escaped (a stray `(` used to throw) | `utils/apiFeatures.js` |
| **New** `GET /api/v1/shipping/check?pincode=XXXXXX`. Live Shiprocket serviceability when `SHIPROCKET_*` creds exist (`estimated:false`, optional env `SHIPROCKET_PICKUP_PINCODE`, default 110015); otherwise an estimate from settings with `estimated:true`. | `controllers/shipping.controller.js`, `routes/shipping.routes.js`, `services/shipping.service.js`, `routes/index.js` |
| Seed: textures, lace types, hair types, densities, sample banners for every placement, 3 announcements, 5 default policies. Uses `/uploads/seed-placeholder.svg` because `Banner.image` is required. | `utils/seed.js`, `uploads/seed-placeholder.svg` |

Note: the API prefix in this project is `/api/v1`, so the endpoint is `/api/v1/shipping/check`.

## Admin
* Attributes: **Lace Type** tab; **Thumbnail Image** field for Hair Texture / Hair Type.
* Products: **Lace Type** dropdown (attributes tab) and a Lace Type column in variants; shown in product details.
* Banners: 3 new placements (form + filter).
* Website Content: **Header** tab has *Announcement Bar Messages*; new **Policy Pages** tab (slug, title, nested sections); Footer tab has *Payment Methods*; the new Home sections appear in *Home Sections* (toggle/reorder), also for sites saved before this update.
* Settings: *Estimated Delivery Min/Max Days*.

## Storefront
* Tokens: cream `#FBF7EF`, beige `#F3EADD`, espresso `#1E1410`, brown-gold buttons `#A9773D`/`#8A5F2E`, black Add to Cart `#1A1A1A`, card border `#E8DED2`.
* **Header**: announcement bar (3 side by side on desktop, rotating on mobile), logo + wide rounded search + account/wishlist/cart, second row from categories (`showInMegaMenu`) + Offers. Mobile drawer kept. **Footer**: brand, columns, Connect With Us, payment row, floating WhatsApp. **TrustBadges**: 5 pills, keyword-picked icons.
* **Home**: hero slider, trust strip, Shop by Category, Shop by Texture, mid banner, Best Sellers carousel, 3 promo cards, Seasonal Offers, Special Offers (+ coupon banner), Before & After + Try-On tile, Hair Care Guide, Customer Reviews, Instagram, Newsletter. Honors `homeSections` enabled/order.
* **Shop / category pages**: category banner, accordion filters (Hair Type, Length, Texture, Colour, Lace Type, Density, Price + Apply Filters), sort, grid/list toggle, 3-col grid (2 on tablet/mobile), numbered pagination. Deep links: `?category=`, `?texture=`, `?hairType=`, `?laceType=`, `?sort=`, `?onSale=1`.
* **Product**: Texture/Hair Type, Lace Type and Density option groups, brown Add to Cart + dark Buy Now, **Check Delivery** (marked as an estimate when it is one), tabs, Why-choose row (from `whyChooseUs`), You-may-also-like carousel.
* Cart (You may also like, coupon card), Checkout (relabelled 4-step stepper, "Continue to Payment"), Search (filters), Wishlist (Move to Cart), Account (welcome, stat cards, Support), Login (form-left card), FAQ (categories from real data), About (feature row), Policy (reads `siteContent.policies`, numbered sections), Popup (once per session).

## Admin steps to fill content
| Storefront section | Where / placement | Recommended size |
|---|---|---|
| Hero (text + image) | Website Content → Hero Banner; extra slides: Banner `home-hero` | 1400×900 (image right) |
| Shop by Category | Categories → image | 400×400 |
| Shop by Texture | Attributes → Hair Texture → Thumbnail Image | 400×400 |
| Wide mid banner | Banner `home-mid` | 1600×500 |
| 3 promo cards / special tiles | Banner `offer-card` (first 3 = promo cards, the rest = Special Offers) | 700×400 |
| Seasonal Offers (4) | Banner `seasonal-offer` | 600×750 |
| Virtual Try-On tile | Banner `home-strip` (first one, link only) | 1000×560 |
| Category page banner | Category → Banner, else Banner `category-top` | 1600×450 |
| Popup | Banner `popup` | 800×500 |
| Before & After | Website Content → Before / After | 800×600 each |
| Instagram | Website Content → Instagram & Videos | 600×600 |
| Announcements / policies / footer / payment icons | Website Content → Header / Policy Pages / Footer | n/a |

## Image slots that still need real photos
Bundled repo photos are used only as fallbacks. Please upload real images for: category tiles (esp. Frontals, Raw Hair),
all six texture thumbnails (fallback reuses product photos), mid banner, offer/seasonal/special banners, try-on tile,
category banners, popup, and before/after pairs. Sizes are in the table above.

## Not done / assumptions
* **Virtual Try-On** is only a link banner, as requested.
* **Cart GST row**: the cart has no tax logic, so none is shown (not invented).
* **Account Coupons** menu item: there is no per-user coupon endpoint; **Support** links to Contact.
* Seeded categories (`temple-bundles`, `wigs`, `closures`...) differ from the mockup's Wigs/Bundles/Frontals/Raw Hair. Category slugs are admin-defined; create/rename them and the header row, tiles and `/shop?category=<slug>` follow automatically.
* Seed banners use a placeholder image; the storefront treats it as "no image" and falls back to bundled photos.
* The product page's existing bulk-price table (5/10/15% steps) and the older Cart shipping rule were left as they were (existing logic/content).
* The shop still filters client-side over the first 100 products (unchanged); the new backend filters/`total` are ready for server-side paging.
* Checkout step 4 is "Review Order" (the existing step), not "Order Confirmed", which is a separate page.
* Lint: `npx oxlint src` shows 0 errors (warnings pre-existing/react-refresh). `npm run build` in the frontend chains to a missing `../bir-hair-admin`; use `npx vite build`, which passes. Admin `npm run build` passes. No browser/visual test or live Mongo run was possible here.
