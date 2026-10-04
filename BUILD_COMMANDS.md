# Indian Temple Hair Export: Build & Run Guide (USD store + new logo)

Requirements: Node.js 18+ (tested on Node 22), npm, a MongoDB URI.
Project folders:
- `indian-temple-hair-backend`  : API (port 5000)
- `indian-temple-hair-admin`    : Admin panel (dev port 5174)
- `indian-templ-hair-frontend`  : Customer storefront (dev port 5173). Also serves the built admin at `/admin`.

---------------------------------------------------------------
## 1) BACKEND
```bash
cd indian-temple-hair-backend
npm install
# .env must exist (MONGO_URI, JWT_SECRET, CLIENT_URL, ADMIN_URL, PAYPAL_* ...). See .env.example
npm test            # 23 tests should pass
npm run dev         # development (nodemon)   OR
npm start           # production
```
Optional, only on a fresh/empty database:
```bash
npm run seed        # creates admin user, sample categories & products (prices now in USD)
```

### Convert OLD rupee data to dollars (run ONCE only, take a DB backup first)
```bash
node scripts/convert-inr-to-usd.js 84            # dry run: prints what would change
node scripts/convert-inr-to-usd.js 84 --apply    # really writes it
```
(84 = your rupees per 1 USD. Do not run `--apply` twice.)

---------------------------------------------------------------
## 2) ADMIN PANEL (separate app)
```bash
cd indian-temple-hair-admin
npm install
npm run dev         # http://localhost:5174
npm run build       # output: indian-temple-hair-admin/dist
```

### Put the built admin inside the storefront (needed for /admin on the storefront domain)
```bash
# run from the project root ("Indian Temple Hair Export")
rm -rf indian-templ-hair-frontend/public/admin/assets
mkdir -p indian-templ-hair-frontend/public/admin/assets
cp indian-temple-hair-admin/dist/assets/*     indian-templ-hair-frontend/public/admin/assets/
cp indian-temple-hair-admin/dist/index.html   indian-templ-hair-frontend/public/admin/index.html
cp indian-temple-hair-admin/dist/logo.png     indian-templ-hair-frontend/public/admin/logo.png
```
(On Windows PowerShell use `Remove-Item`/`Copy-Item`, or just copy the files by hand.)

---------------------------------------------------------------
## 3) STOREFRONT (customer website)
```bash
cd indian-templ-hair-frontend
npm install
npm run dev         # http://localhost:5173
npm run build       # output: indian-templ-hair-frontend/dist
npm run lint        # optional (0 errors expected)
```
Deploy the `dist` folder (Vercel config already in `vercel.json`).

---------------------------------------------------------------
## 4) ONE-SHOT FULL BUILD (from project root)
```bash
cd indian-temple-hair-backend && npm install && npm test && cd ..
cd indian-temple-hair-admin   && npm install && npm run build && cd ..
rm -rf indian-templ-hair-frontend/public/admin/assets && mkdir -p indian-templ-hair-frontend/public/admin/assets
cp indian-temple-hair-admin/dist/assets/* indian-templ-hair-frontend/public/admin/assets/
cp indian-temple-hair-admin/dist/index.html indian-templ-hair-frontend/public/admin/index.html
cp indian-temple-hair-admin/dist/logo.png   indian-templ-hair-frontend/public/admin/logo.png
cd indian-templ-hair-frontend && npm install && npm run build && cd ..
```

---------------------------------------------------------------
## 5) AFTER FIRST RUN: Admin settings (important)
1. Admin → Settings → Shipping: Standard / Express / Free-above amounts in USD (defaults $15 / $35 / $200).
2. Admin → Settings → Payments: enter PayPal Client ID + Secret (+ Webhook ID), switch PayPal ON, turn Cash on Delivery OFF for international buyers, Save.
3. PayPal webhook URL to register: `https://YOUR-API-DOMAIN/api/v1/payments/paypal/webhook`
4. Use PayPal `sandbox` for testing, `live` for real money.

## What changed in this version
- Logo replaced (storefront header + favicon, admin sidebar/login/favicon).
- All prices, shipping, coupons, orders, invoices and PayPal charges are in USD. No INR, no exchange rate.
- Razorpay routes disabled (INR-only). Checkout asks ZIP/Postal code and Country (no India default).
