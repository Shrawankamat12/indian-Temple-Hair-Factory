# Indian Temple Remy Hair Exports — Backend (Node + Express + MongoDB)

Indian Temple Remy Hair Exports (New Delhi) ke storefront aur admin panel ke liye REST API.
Saara content — home page, footer, header, settings — admin panel se editable hai, redeploy ki zarurat nahi.

**Company:** Indian Temple Remy Hair Exports
**Contact:** Jasleen Bajaj · +91 89203 11195 · indiantemplehairexports@gmail.com
**Address:** 69/6A, Plot No. 74, Najafgarh Road Industrial Area, New Delhi 110015
**GSTIN:** 07AGVPB7155J1ZY

## Setup
```bash
cd indian-temple-hair-backend
npm install
cp .env.example .env   # MONGO_URI, JWT_SECRET set karo
npm run seed            # categories + admin user (admin@indiantemplehair.com / Admin@123) create karta hai
npm run dev              # nodemon se server start (default port 5000)
```

## Folder Structure
```
indian-temple-hair-backend/
├── server.js                 # entry point
├── .env.example
├── src/
│   ├── app.js                 # express app, middleware, route mounting
│   ├── config/
│   │   └── db.js              # mongoose connection
│   ├── models/                # mongoose schemas
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── User.js             (customer + admin/staff roles)
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── Review.js
│   │   ├── Blog.js
│   │   ├── Testimonial.js
│   │   ├── Faq.js
│   │   ├── Banner.js           (home hero / promo strips)
│   │   ├── Coupon.js
│   │   ├── ContactMessage.js
│   │   ├── WholesaleInquiry.js
│   │   └── Newsletter.js
│   ├── controllers/            # business logic, 1 file per resource
│   ├── routes/
│   │   ├── index.js             # mounts all public + customer routes
│   │   ├── *.routes.js          # public/customer routes
│   │   └── admin/                # admin-only routes (protect + adminOnly)
│   │       ├── index.js
│   │       └── *.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect
│   │   ├── admin.middleware.js   # role check
│   │   ├── upload.middleware.js  # multer image upload
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── generateOrderNumber.js
│   │   ├── apiFeatures.js        # filter/search/sort/paginate helper
│   │   └── seed.js
│   └── uploads/                  # uploaded product/blog/banner images
```

## API Overview (base: `/api/v1`)

Public (frontend consumes these for Home/Shop/ProductDetail/Blog/FAQ/Contact/Wholesale pages):
- `GET /products` — filters: `?category=&texture=&hairType=&price[gte]=&price[lte]=&sort=&search=&page=&limit=`
- `GET /products/:idOrSlug`
- `GET /products/badge/:badge` — Bestseller | New | Trending | Editor's Pick
- `GET /categories`
- `GET /blogs`, `GET /blogs/:slug`
- `GET /testimonials`
- `GET /faqs`
- `GET /banners?placement=home-hero`
- `POST /coupons/apply`
- `POST /contact`
- `POST /wholesale`
- `GET /reviews/product/:productId`, `POST /reviews`

Auth:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/admin-login`, `GET /auth/me`, `POST /auth/logout`

Customer (JWT cookie/token required — Cart, Wishlist, Account, Checkout pages):
- `GET|POST|PUT|DELETE /cart`
- `GET /wishlist`, `POST /wishlist/toggle`
- `POST /orders` (guest checkout allowed), `GET /orders/my`, `GET /orders/:id` (order tracking)
- `PUT /users/profile`, `POST|PUT|DELETE /users/addresses`

Admin panel (JWT + role=admin/staff, base `/api/v1/admin`):
- `/admin/dashboard` — stats for dashboard cards
- `/admin/products`, `/admin/categories` — full CRUD
- `/admin/orders` — list + update status/tracking
- `/admin/users` — manage customers/staff
- `/admin/blogs`, `/admin/testimonials`, `/admin/faqs`, `/admin/banners`, `/admin/coupons` — CMS CRUD
- `/admin/reviews` — approve/delete
- `/admin/contact-messages`, `/admin/wholesale-inquiries` — lead management
- `/admin/upload` — image upload (multipart `image` field)

## Frontend integration notes
- Static imports (`src/data/products.js`) ki jagah niche diye endpoints par `fetch`/`axios` call karo with `fetch`/`axios` calls to the endpoints above.
- `StoreContext.jsx` cart/wishlist logic should call `/cart` and `/wishlist` instead of local `useState` once a user is logged in (keep guest cart in localStorage as fallback if desired).
- `Checkout.jsx` should POST to `/orders`, then redirect to `/order-confirmation` using the returned `orderNumber`.
