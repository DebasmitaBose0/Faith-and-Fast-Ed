import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import OrderModel from '../models/orderModel.js';
import Product from '../models/productModel.js';

/**
 * Order Analytics (Admin)
 *
 * All metrics are computed inside MongoDB via aggregation pipelines — no order
 * documents are pulled into Node and reduced in memory. This keeps the endpoint
 * fast and scalable as the order collection grows.
 *
 * Optional query params:
 *   startDate  ISO date string (inclusive)  — filters createdAt >= startDate
 *   endDate    ISO date string (inclusive)  — filters createdAt <= endDate (end of day)
 *   interval   "day" | "month"  (default "day") — bucket size for the time series
 *
 * Revenue convention:
 *   "Revenue" / "Sales" sums `totalAmount` over orders whose orderStatus is NOT
 *   CANCELLED, because a cancelled order represents no realized sale. Order-growth
 *   counts every order (including cancelled) so the two series stay distinct and
 *   each answers its own question.
 */
export const getOrderAnalytics = catchAsyncErrors(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const interval = req.query.interval === 'month' ? 'month' : 'day';

    // ----- Build an optional createdAt date filter -----
    const dateFilter = {};
    if (startDate) {
      const from = new Date(startDate);
      if (!isNaN(from.getTime())) {
        dateFilter.$gte = from;
      }
    }
    if (endDate) {
      const to = new Date(endDate);
      if (!isNaN(to.getTime())) {
        // include the entire end day
        to.setHours(23, 59, 59, 999);
        dateFilter.$lte = to;
      }
    }
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Base match applied to every pipeline (date window only).
    const baseMatch = hasDateFilter ? { createdAt: dateFilter } : {};

    // Money math excludes cancelled orders.
    const revenueMatch = { ...baseMatch, orderStatus: { $ne: 'CANCELLED' } };

    // Date-bucket format string for $dateToString.
    const dateFormat = interval === 'month' ? '%Y-%m' : '%Y-%m-%d';

    // ----- 1. Summary (single-doc rollup via $facet) -----
    const summaryPipeline = [
      { $match: baseMatch },
      {
        $facet: {
          // Revenue + units over non-cancelled orders.
          revenue: [
            { $match: { orderStatus: { $ne: 'CANCELLED' } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                paidOrders: { $sum: 1 },
              },
            },
          ],
          // Units sold (sum of quantities) over non-cancelled orders.
          units: [
            { $match: { orderStatus: { $ne: 'CANCELLED' } } },
            { $unwind: '$products' },
            {
              $group: {
                _id: null,
                totalUnits: { $sum: '$products.quantity' },
              },
            },
          ],
          // Count of every order in range (incl cancelled).
          allOrders: [{ $count: 'count' }],
          // Order status breakdown.
          byStatus: [{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }],
          // Payment status breakdown.
          byPayment: [
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
          ],
        },
      },
    ];

    // ----- 2. Revenue trend (time series, non-cancelled) -----
    const revenueTrendPipeline = [
      { $match: revenueMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          revenue: 1,
          orders: 1,
        },
      },
    ];

    // ----- 3. Order growth (time series, ALL orders) -----
    const orderGrowthPipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          orders: 1,
        },
      },
    ];

    // ----- 4. Top-selling products (non-cancelled) -----
    const topProductsPipeline = [
      { $match: revenueMatch },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          unitsSold: { $sum: '$products.quantity' },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$products.quantity', 0] },
                { $ifNull: ['$products.price', 0] },
              ],
            },
          },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          unitsSold: 1,
          revenue: 1,
          name: {
            $ifNull: [
              { $arrayElemAt: ['$product.name', 0] },
              'Unknown product',
            ],
          },
          image: {
            $ifNull: [{ $arrayElemAt: ['$product.images.url', 0] }, null],
          },
        },
      },
    ];

    const [summaryResult, revenueTrend, orderGrowth, topProducts] =
      await Promise.all([
        OrderModel.aggregate(summaryPipeline),
        OrderModel.aggregate(revenueTrendPipeline),
        OrderModel.aggregate(orderGrowthPipeline),
        OrderModel.aggregate(topProductsPipeline),
      ]);

    // ----- Normalise the faceted summary into a flat, safe shape -----
    const facet = summaryResult[0] || {};
    const totalRevenue = facet.revenue?.[0]?.totalRevenue || 0;
    const paidOrders = facet.revenue?.[0]?.paidOrders || 0;
    const totalUnits = facet.units?.[0]?.totalUnits || 0;
    const totalOrders = facet.allOrders?.[0]?.count || 0;
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

    const statusDistribution = (facet.byStatus || []).map((s) => ({
      status: s._id || 'UNKNOWN',
      count: s.count,
    }));
    const paymentDistribution = (facet.byPayment || []).map((p) => ({
      status: p._id || 'UNKNOWN',
      count: p.count,
    }));

    // ===== Advanced reporting (#62) — all additive, no existing output changed =====

    // ----- 5. Period-over-period revenue comparison -----
    // Current window = the selected range when both dates are given, otherwise
    // the trailing 30 days. Previous window = the immediately preceding window of
    // equal length, so "% change vs previous period" is always meaningful.
    const now = new Date();
    const startValid = startDate && !isNaN(new Date(startDate).getTime());
    const endValid = endDate && !isNaN(new Date(endDate).getTime());

    let curStart;
    let curEnd;
    if (startValid && endValid) {
      curStart = new Date(startDate);
      curEnd = new Date(endDate);
      curEnd.setHours(23, 59, 59, 999);
    } else {
      curEnd = now;
      curStart = new Date(now);
      curStart.setDate(curStart.getDate() - 30);
    }
    const windowMs = curEnd.getTime() - curStart.getTime();
    const prevEnd = new Date(curStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - windowMs);

    const periodRevenue = async (from, to) => {
      const result = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: from, $lte: to },
            orderStatus: { $ne: 'CANCELLED' },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
      ]);
      return {
        revenue: result[0]?.revenue || 0,
        orders: result[0]?.orders || 0,
      };
    };

    const pctChange = (cur, prev) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    // ----- 6. Customer trends (new vs repeat, top spenders) -----
    const customerGroupsPipeline = [
      { $match: revenueMatch },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          spend: { $sum: '$totalAmount' },
        },
      },
    ];

    const topCustomersPipeline = [
      { $match: revenueMatch },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          spend: { $sum: '$totalAmount' },
        },
      },
      { $sort: { spend: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          orders: 1,
          spend: 1,
          name: {
            $ifNull: [{ $arrayElemAt: ['$user.name', 0] }, 'Unknown customer'],
          },
          email: { $ifNull: [{ $arrayElemAt: ['$user.email', 0] }, ''] },
        },
      },
    ];

    // ----- 7. Inventory analytics (from the product catalogue) -----
    const lowStockThreshold =
      Number(req.query.lowStockThreshold) > 0
        ? Number(req.query.lowStockThreshold)
        : 5;

    const inventoryPipeline = [
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          outOfStock: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$stock', 0] },
                    { $lte: ['$stock', lowStockThreshold] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          inventoryValue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stock', 0] },
                { $ifNull: ['$price', 0] },
              ],
            },
          },
        },
      },
    ];

    const [curPeriod, prevPeriod, customerGroups, topCustomers, inventoryAgg] =
      await Promise.all([
        periodRevenue(curStart, curEnd),
        periodRevenue(prevStart, prevEnd),
        OrderModel.aggregate(customerGroupsPipeline),
        OrderModel.aggregate(topCustomersPipeline),
        Product.aggregate(inventoryPipeline),
      ]);

    const totalCustomers = customerGroups.length;
    const repeatCustomers = customerGroups.filter((c) => c.orders > 1).length;
    const newCustomers = totalCustomers - repeatCustomers;

    const inv = inventoryAgg[0] || {};

    const comparison = {
      current: curPeriod,
      previous: prevPeriod,
      revenueChange: pctChange(curPeriod.revenue, prevPeriod.revenue),
      ordersChange: pctChange(curPeriod.orders, prevPeriod.orders),
      usedSelectedRange: Boolean(startValid && endValid),
    };

    const customers = {
      totalCustomers,
      newCustomers,
      repeatCustomers,
      repeatRate:
        totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
      topCustomers,
    };

    const inventory = {
      totalProducts: inv.totalProducts || 0,
      outOfStock: inv.outOfStock || 0,
      lowStock: inv.lowStock || 0,
      inventoryValue: inv.inventoryValue || 0,
      lowStockThreshold,
    };

    return res.status(200).json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          totalOrders,
          paidOrders,
          totalUnits,
          averageOrderValue,
        },
        revenueTrend,
        orderGrowth,
        topProducts,
        statusDistribution,
        paymentDistribution,
        comparison,
        customers,
        inventory,
        range: {
          startDate: startDate || null,
          endDate: endDate || null,
          interval,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
