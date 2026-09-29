const slugify = require('slugify');
const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { productRepository } = require('../repositories');
const ApiFeatures = require('../utils/apiFeatures');
const Category = require('../models/Category');

class ProductService extends BaseService {
  constructor() {
    super(productRepository, 'Product');
  }

  /**
   * Public shop listing. Supports (all optional, all additive to the generic ApiFeatures filters):
   *   category=<slug|id>  texture|hairTexture  hairType  length  color|hairColour  laceType  hairDensity|density
   *   (each accepts a comma list: texture=Straight,Body%20Wave)
   *   price[gte]/price[lte]  rating[gte]  search  page  limit
   *   sort=price-asc|price-desc|newest|popularity|rating (or any raw mongoose sort string, e.g. -price)
   * `total` is the count of products matching the applied filters (not the whole catalogue).
   */
  async listPublic(queryString = {}) {
    const q = { ...queryString };
    const and = [];
    const esc = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const list = (v) => String(v).split(',').map((x) => x.trim()).filter(Boolean);
    const ci = (values) => values.map((v) => new RegExp(`^${esc(v)}$`, 'i'));
    const take = (...keys) => { let v; keys.forEach((k) => { if (q[k] !== undefined && q[k] !== '') v = v ?? q[k]; delete q[k]; }); return v; };

    // category: slug(s) or ObjectId(s)
    const category = take('category');
    if (category) {
      const parts = list(category);
      const ids = parts.filter((p) => /^[0-9a-fA-F]{24}$/.test(p));
      const slugs = parts.filter((p) => !/^[0-9a-fA-F]{24}$/.test(p)).map((p) => p.toLowerCase());
      const found = slugs.length ? await Category.find({ slug: { $in: slugs } }).select('_id') : [];
      and.push({ category: { $in: [...ids, ...found.map((c) => c._id)] } });
    }

    // text-ish attributes stored both on the product and inside variants
    const attr = (paramKeys, productFields, variantField) => {
      const v = take(...paramKeys);
      if (!v) return;
      const re = ci(list(v));
      and.push({ $or: [...productFields.map((f) => ({ [f]: { $in: re } })), ...(variantField ? [{ [variantField]: { $in: re } }] : [])] });
    };
    attr(['texture', 'hairTexture'], ['texture', 'hairTexture'], 'variants.texture');
    attr(['color', 'hairColour'], ['color', 'hairColour'], 'variants.colour');
    attr(['laceType'], ['laceType'], 'variants.laceType');
    attr(['hairDensity', 'density'], ['hairDensity'], 'variants.density');
    attr(['hairType'], ['hairType'], null);

    // length (inches). Product.length is a Number, variants.length is a String.
    const length = take('length');
    if (length && typeof length !== 'object') {
      const nums = list(length).map(Number).filter((n) => !Number.isNaN(n));
      if (nums.length) and.push({ $or: [{ length: { $in: nums } }, { 'variants.length': { $in: nums.map(String) } }] });
    } else if (length && typeof length === 'object') {
      q.length = length; // length[gte]/length[lte] handled by the generic filter
    }

    const sortMap = {
      'price-asc': 'price', 'price-desc': '-price', newest: '-createdAt',
      popularity: '-reviewsCount -rating', rating: '-rating -reviewsCount', featured: '-featured -createdAt',
    };
    if (q.sort && sortMap[q.sort]) q.sort = sortMap[q.sort];

    const base = { isActive: true, visibility: { $ne: 'hidden' }, ...(and.length && { $and: and }) };
    const features = new ApiFeatures(
      this.repository.model.find(base).populate({ path: 'category', select: 'name slug' }),
      q
    ).filter().search(['name', 'sku', 'tags']).sort().paginate();

    const total = await this.repository.model.countDocuments(features.query.getFilter());
    const data = await features.query;
    const page = parseInt(q.page, 10) || 1;
    const limit = parseInt(q.limit, 10) || 20;
    return { data, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Admin panel sees every product (active + inactive), unpaginated by default so the
   *  reusable EntityListPage table can do client-side search/sort/pagination. */
  async listAdmin(queryString = {}) {
    return this.repository.find({}, { sort: '-createdAt', populate: { path: 'category', select: 'name slug' } });
  }

  async getByIdOrSlug(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await this.repository.findOne(filter, {
      populate: { path: 'category', select: 'name slug' },
    });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  /**
   * The admin panel (see indian-temple-hair-admin) posts a slightly different field
   * shape than the original storefront schema — this reconciles the two
   * without touching any existing storefront field or behavior.
   */
  normalize(payload) {
    const body = { ...payload };
    if (body.categoryId) { body.category = body.categoryId; delete body.categoryId; }
    if (body.subcategoryId) { body.subcategory = body.subcategoryId; delete body.subcategoryId; }
    if (body.collectionId) { body.collectionRef = body.collectionId; delete body.collectionId; }
    if (body.brandId) { body.brand = body.brandId; delete body.brandId; }
    ['subcategory', 'collectionRef', 'brand'].forEach((k) => { if (body[k] === '') delete body[k]; });
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    if (Array.isArray(body.gallery)) {
      body.images = body.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean);
    }
    // Admin "Price" = MRP, admin "Discount Price" = actual selling price.
    // Guarded so this is a no-op if normalizeProductBody middleware already ran (mrp already set).
    if (body.mrp === undefined && body.price !== undefined && body.price !== '') {
      const mrp = Number(body.price);
      const sell = body.discountPrice !== undefined && body.discountPrice !== '' ? Number(body.discountPrice) : mrp;
      body.mrp = mrp;
      body.price = sell;
      body.discountPct = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
    } else if (body.mrp !== undefined && body.discountPct === undefined) {
      const mrp = Number(body.mrp);
      const sell = Number(body.price ?? mrp);
      body.discountPct = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
    }
    return body;
  }

  async create(payload) {
    const body = { ...this.normalize(payload), slug: slugify(payload.name, { lower: true, strict: true }) };
    return this.repository.create(body);
  }

  async updateById(id, payload) {
    const body = this.normalize(payload);
    if (body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    return super.updateById(id, body, { new: true, runValidators: true });
  }

  async getByBadge(badge) {
    return this.repository.find({ badge, isActive: true, visibility: { $ne: 'hidden' } });
  }

  /** Homepage shelves: /products?flag=trending etc. also work generically via ApiFeatures,
   *  this is a small convenience wrapper used by the byFlag route for a clean public URL. */
  async getByFlag(flag, limit = 12) {
    const allowed = ['featured', 'newArrival', 'trending', 'premium', 'bestSeller', 'flashSale', 'recommended'];
    if (!allowed.includes(flag)) throw new AppError('Unknown product flag', 400);
    return this.repository.find(
      { [flag]: true, isActive: true, visibility: { $ne: 'hidden' } },
      { sort: '-createdAt', limit, populate: { path: 'category', select: 'name slug' } }
    );
  }
}

module.exports = new ProductService();
