const {
  orderRepository, productRepository, userRepository, wholesaleRepository,
  categoryRepository, brandRepository, notificationRepository, activityLogRepository,
} = require('../repositories');
const Review = require('../models/Review');
const ContactMessage = require('../models/ContactMessage');

// Only money that has really been captured counts as sales. (The old pipeline read `paymentStatus`/`total`/`status`,
// fields that do not exist on Order, so revenue and the status breakdown were always zero.)
const PAID = { 'payment.status': 'paid' };
const COUNTED = { orderStatus: { $nin: ['cancelled', 'refunded'] } };

class DashboardService {
  async getSummary() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      ordersCount, productsCount, customersCount, categoriesCount, brandsCount, pendingInquiries,
      revenueAgg, recentOrdersRaw, lowStock, salesByDayAgg, statusBreakdownAgg,
      recentCustomers, bestSellersAgg, categoryAgg, notificationsRaw, activityRaw,
      paymentAgg, totalReviews, pendingReviews, totalInquiries, newContactMessages,
    ] = await Promise.all([
      orderRepository.count(),
      productRepository.count(),
      userRepository.count({ role: 'customer' }),
      categoryRepository.count(),
      brandRepository.count(),
      wholesaleRepository.count({ status: 'new' }),
      orderRepository.aggregate([
        { $match: { ...PAID, ...COUNTED } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' }, paidOrders: { $sum: 1 } } },
      ]),
      orderRepository.find({}, { sort: '-createdAt', limit: 6, populate: { path: 'user', select: 'name email' } }),
      productRepository.find({ $expr: { $lte: ['$stock', '$minStock'] } }, { select: 'name stock sku minStock' }),
      orderRepository.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo }, ...PAID, ...COUNTED } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.grandTotal' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      orderRepository.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      userRepository.find({ role: 'customer' }, { sort: '-createdAt', limit: 6, select: 'name email createdAt' }),
      orderRepository.aggregate([
        { $match: { ...PAID, ...COUNTED } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.productName' }, image: { $first: '$items.image' }, unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 6 },
      ]),
      productRepository.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$cat.name', 'Uncategorized'] }, value: 1 } },
        { $sort: { value: -1 } },
        { $limit: 6 },
      ]),
      notificationRepository.find({}, { sort: '-createdAt', limit: 5 }),
      activityLogRepository.find({}, { sort: '-createdAt', limit: 6 }),
      orderRepository.aggregate([{ $match: { 'payment.method': { $ne: 'cod' } } }, { $group: { _id: '$payment.status', count: { $sum: 1 } } }]),
      Review.countDocuments({}),
      Review.countDocuments({ status: 'pending' }),
      wholesaleRepository.count(),
      ContactMessage.countDocuments({ status: 'new' }),
    ]);
    const paymentCounts = { pending: 0, processing: 0, failed: 0 };
    paymentAgg.forEach((p) => { if (p._id in paymentCounts) paymentCounts[p._id] = p.count; });

    // Fill in any missing days in the last 14 so the chart doesn't have gaps.
    const salesTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const match = salesByDayAgg.find((r) => r._id === key);
      salesTrend.push({ date: key, revenue: match?.revenue || 0, orders: match?.orders || 0 });
    }

    const ordersByStatus = statusBreakdownAgg.map((s) => ({ status: s._id, count: s.count }));
    const countFor = (statuses) => statusBreakdownAgg.filter((s) => statuses.includes(s._id)).reduce((sum, s) => sum + s.count, 0);

    const recentOrders = recentOrdersRaw.map((o) => ({
      _id: o._id, orderNumber: o.orderNumber, status: o.orderStatus, total: o.pricing?.grandTotal,
      paymentStatus: o.payment?.status,
      customerName: o.user?.name || o.customerName || o.shippingAddress?.fullName || 'Guest',
    }));

    return {
      revenue: revenueAgg[0]?.total || 0,
      ordersCount, productsCount, customersCount, categoriesCount, brandsCount,
      lowStockCount: lowStock.length,
      pendingOrders: countFor(['pending', 'placed']),
      processingOrders: countFor(['confirmed', 'processing', 'packed']),
      shippedOrders: countFor(['shipped', 'out_for_delivery']),
      deliveredOrders: countFor(['delivered']),
      completedOrders: countFor(['delivered']),
      cancelledOrders: countFor(['cancelled', 'returned', 'refunded']),
      paidOrders: revenueAgg[0]?.paidOrders || 0,
      pendingPayments: paymentCounts.pending + paymentCounts.processing,
      failedPayments: paymentCounts.failed,
      totalReviews,
      pendingReviews,
      pendingInquiries,
      totalInquiries,
      newContactMessages,
      recentOrders,
      recentCustomers,
      bestSellers: bestSellersAgg,
      salesTrend,
      ordersByStatus,
      categoryBreakdown: categoryAgg,
      lowStock,
      notifications: notificationsRaw.map((n) => ({ message: n.message ? `${n.title} — ${n.message}` : n.title, type: n.type, at: n.createdAt })),
      activity: activityRaw.map((a) => ({ message: `${a.userName || 'System'} ${a.action} ${a.entity}`, at: a.createdAt })),
    };
  }
}

module.exports = new DashboardService();
