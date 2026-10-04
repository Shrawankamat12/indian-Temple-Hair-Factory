import { api } from './api';

export const authApi = {
  // Current logged-in user
  me: () => api.get('/auth/me'),

  // Normal login
  login: (payload) => api.post('/auth/login', payload),

  // Normal registration
  register: (payload) => api.post('/auth/register', payload),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Forgot password
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (payload) =>
    api.post('/auth/reset-password', payload),
};

export const productsApi = {
  list: (query) => api.get('/products', query),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  byBadge: (badge) =>
    api.get(`/products/badge/${encodeURIComponent(badge)}`),
  byFlag: (flag, limit) =>
    api.get(
      `/products/flag/${flag}`,
      limit ? { limit } : undefined
    ),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
};

export const subcategoriesApi = {
  list: (categoryId) =>
    api.get(
      '/subcategories',
      categoryId ? { categoryId } : undefined
    ),
};

export const brandsApi = {
  list: () => api.get('/brands'),
};

export const collectionsApi = {
  list: () => api.get('/collections'),
};

export const attributesApi = {
  list: (type) =>
    api.get(
      '/attributes',
      type ? { type } : undefined
    ),
};

export const siteContentApi = {
  get: () => api.get('/site-content'),
};

export const blogsApi = {
  list: (category) =>
    api.get(
      '/blogs',
      category ? { category } : undefined
    ),

  get: (slug) => api.get(`/blogs/${slug}`),
};

export const faqsApi = {
  list: () => api.get('/faqs'),
};

export const testimonialsApi = {
  list: () => api.get('/testimonials'),
};

export const bannersApi = {
  list: (placement) =>
    api.get(
      '/banners',
      placement ? { placement } : undefined
    ),
};

export const reviewsApi = {
  // Envelope is { data: reviews[], summary: { average, count, distribution: {1..5} }, page, pages }
  forProduct: (productId, params) =>
    api.get(`/reviews/product/${productId}`, params),

  eligibility: (productId) =>
    api.get(`/reviews/product/${productId}/eligibility`),

  create: (payload) =>
    api.post('/reviews', payload),
};

export const cartApi = {
  get: () => api.get('/cart'),

  add: (productId, qty = 1, variantId = null) =>
    api.post('/cart', {
      productId,
      qty,
      variantId,
    }),

  update: (
    productId,
    qty,
    variantId = null
  ) =>
    api.put(`/cart/${productId}`, {
      qty,
      variantId,
    }),

  remove: (
    productId,
    variantId = null
  ) =>
    api.del(`/cart/${productId}`, {
      variantId,
    }),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),

  toggle: (productId) =>
    api.post('/wishlist/toggle', {
      productId,
    }),
};

export const couponsApi = {
  apply: (code, subtotal) =>
    api.post('/coupons/apply', {
      code,
      subtotal,
    }),
};

export const ordersApi = {
  create: (payload) =>
    api.post('/orders', payload),

  mine: () =>
    api.get('/orders/my'),

  get: (idOrOrderNumber, token) =>
    api.get(`/orders/${idOrOrderNumber}`, token ? { token } : undefined),
};

export const settingsApi = {
  // Business info, shipping rates and policy flags (whitelisted, no secrets).
  public: () => api.get('/settings/public'),
};

export const paymentsApi = {
  // Which methods the checkout may offer (+ the public PayPal Client ID). No secrets.
  methods: () => api.get('/payments/methods'),

  // PayPal: the browser never sends an amount. The server prices the stored order.
  paypalCreate: (orderId, accessToken) =>
    api.post('/payments/paypal/order', { orderId, accessToken }),

  paypalCapture: (orderId, paypalOrderId, accessToken) =>
    api.post('/payments/paypal/capture', { orderId, paypalOrderId, accessToken }),
};

export const usersApi = {
  updateProfile: (payload) =>
    api.put('/users/profile', payload),

  addAddress: (payload) =>
    api.post('/users/addresses', payload),

  updateAddress: (addressId, payload) =>
    api.put(
      `/users/addresses/${addressId}`,
      payload
    ),

  deleteAddress: (addressId) =>
    api.del(`/users/addresses/${addressId}`),
};

export const contactApi = {
  submit: (payload) =>
    api.post('/contact', payload),
};

export const wholesaleApi = {
  submit: (payload) =>
    api.post('/wholesale', payload),
};

export const shippingApi = {
  // Delivery estimate for a pincode. `estimated: true` means it is NOT live courier data.
  check: (pincode) => api.get('/shipping/check', { pincode }),
};

export const newsletterApi = {
  subscribe: (email) =>
    api.post('/newsletter/subscribe', { email }),
};