import type {
  AdminConversationRecord,
  AdminOrderRecord,
  AdminUserRecord,
} from "@/types/admin";
import type { Product } from "@/types/product";
import {
  getOrderItemsCount,
  getOrderStatusLabel,
  getOrderTotal,
  getOrderUserName,
  getUserDisplayName,
  getUserJoinedAt,
  isUserActive,
} from "@/lib/adminTransformers";

export type AdminTimelineRow = {
  monthKey: string;
  period: string;
  revenue: number;
  orders: number;
  items: number;
  averageOrderValue: number;
  delivered: number;
  processing: number;
  pending: number;
  cancelled: number;
  newUsers: number;
  conversations: number;
};

export type AdminBreakdownRow = {
  key: string;
  name: string;
  value: number;
  revenue?: number;
  quantity?: number;
};

export type AdminTopCustomerRow = {
  name: string;
  spend: number;
  orders: number;
  items: number;
};

export type AdminAnalyticsSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  inventoryUnits: number;
  uniqueCustomers: number;
  totalConversations: number;
  unreadMessages: number;
  deliveredOrders: number;
  processingOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
};

export type AdminAnalyticsDatasets = {
  summary: AdminAnalyticsSummary;
  timeline: AdminTimelineRow[];
  orderStatus: AdminBreakdownRow[];
  paymentMethods: AdminBreakdownRow[];
  productCategories: Array<
    AdminBreakdownRow & {
      products: number;
      inventory: number;
      estimatedValue: number;
    }
  >;
  topCustomers: AdminTopCustomerRow[];
  userStatus: AdminBreakdownRow[];
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseDate = (value?: string | null) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildMonthBuckets = (months: number) => {
  const end = new Date();
  end.setDate(1);
  end.setHours(0, 0, 0, 0);

  return Array.from({ length: months }, (_, index) => {
    const bucketDate = new Date(end);
    bucketDate.setMonth(end.getMonth() - (months - index - 1));

    return {
      date: bucketDate,
      monthKey: getMonthKey(bucketDate),
      period: monthFormatter.format(bucketDate),
    };
  });
};

const getStatusKey = (order?: AdminOrderRecord) => {
  const normalized = getOrderStatusLabel(order).trim().toLowerCase();

  if (normalized === "delivered") return "delivered";
  if (normalized === "processing") return "processing";
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled" || normalized === "canceled") {
    return "cancelled";
  }

  return "pending";
};

const toChartKey = (value: string) =>
  value.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();

export const buildAdminAnalyticsDatasets = ({
  orders,
  users,
  products,
  conversations,
  months = 12,
}: {
  orders: AdminOrderRecord[];
  users: AdminUserRecord[];
  products: Product[];
  conversations: AdminConversationRecord[];
  months?: number;
}): AdminAnalyticsDatasets => {
  const monthBuckets = buildMonthBuckets(months);
  const timeline = monthBuckets.map<AdminTimelineRow>((bucket) => ({
    monthKey: bucket.monthKey,
    period: bucket.period,
    revenue: 0,
    orders: 0,
    items: 0,
    averageOrderValue: 0,
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
    newUsers: 0,
    conversations: 0,
  }));
  const timelineByMonth = new Map(
    timeline.map((bucket) => [bucket.monthKey, bucket]),
  );

  const orderStatusMap = new Map<string, AdminBreakdownRow>();
  const paymentMethodMap = new Map<string, AdminBreakdownRow>();
  const topCustomerMap = new Map<string, AdminTopCustomerRow>();
  const userStatusMap = new Map<string, AdminBreakdownRow>([
    ["active", { key: "active", name: "Active", value: 0 }],
    ["inactive", { key: "inactive", name: "Inactive", value: 0 }],
  ]);
  const productCategoryMap = new Map<
    string,
    AdminBreakdownRow & {
      products: number;
      inventory: number;
      estimatedValue: number;
    }
  >();

  orders.forEach((order) => {
    const orderTotal = getOrderTotal(order);
    const itemsCount = getOrderItemsCount(order);
    const statusKey = getStatusKey(order);
    const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
    const paymentLabel = order.payment_method || order.payment || "Unknown";
    const paymentKey = toChartKey(paymentLabel);
    const orderDate = parseDate(order.created_at);

    if (orderDate) {
      const monthKey = getMonthKey(orderDate);
      const bucket = timelineByMonth.get(monthKey);

      if (bucket) {
        bucket.revenue += orderTotal;
        bucket.orders += 1;
        bucket.items += itemsCount;
        bucket[statusKey] += 1;
      }
    }

    const statusEntry = orderStatusMap.get(statusKey) || {
      key: statusKey,
      name: statusLabel,
      value: 0,
      revenue: 0,
    };
    statusEntry.value += 1;
    statusEntry.revenue = toFiniteNumber(statusEntry.revenue) + orderTotal;
    orderStatusMap.set(statusKey, statusEntry);

    const paymentEntry = paymentMethodMap.get(paymentKey) || {
      key: paymentKey,
      name: paymentLabel,
      value: 0,
      revenue: 0,
    };
    paymentEntry.value += 1;
    paymentEntry.revenue = toFiniteNumber(paymentEntry.revenue) + orderTotal;
    paymentMethodMap.set(paymentKey, paymentEntry);

    const customerKey = String(order.user_id || getOrderUserName(order));
    const customerEntry = topCustomerMap.get(customerKey) || {
      name: getOrderUserName(order) || "Customer",
      spend: 0,
      orders: 0,
      items: 0,
    };
    customerEntry.name = getOrderUserName(order) || customerEntry.name;
    customerEntry.spend += orderTotal;
    customerEntry.orders += 1;
    customerEntry.items += itemsCount;
    topCustomerMap.set(customerKey, customerEntry);
  });

  users.forEach((user) => {
    const statusKey = isUserActive(user) ? "active" : "inactive";
    const statusEntry = userStatusMap.get(statusKey);

    if (statusEntry) {
      statusEntry.value += 1;
    }

    const joinedAt = parseDate(getUserJoinedAt(user));
    if (!joinedAt) return;

    const bucket = timelineByMonth.get(getMonthKey(joinedAt));
    if (bucket) {
      bucket.newUsers += 1;
    }
  });

  conversations.forEach((conversation) => {
    const conversationDate = parseDate(
      conversation.last_message_at || conversation.lastMessageAt,
    );
    if (!conversationDate) return;

    const bucket = timelineByMonth.get(getMonthKey(conversationDate));
    if (bucket) {
      bucket.conversations += 1;
    }
  });

  products.forEach((product) => {
    const categoryName = product.category || "Uncategorized";
    const categoryKey = toChartKey(categoryName);
    const quantity = toFiniteNumber(product.quantity);
    const estimatedValue = toFiniteNumber(product.price) * quantity;
    const categoryEntry = productCategoryMap.get(categoryKey) || {
      key: categoryKey,
      name: categoryName,
      value: 0,
      products: 0,
      inventory: 0,
      estimatedValue: 0,
    };

    categoryEntry.products += 1;
    categoryEntry.inventory += quantity;
    categoryEntry.estimatedValue += estimatedValue;
    categoryEntry.value = categoryEntry.inventory;

    productCategoryMap.set(categoryKey, categoryEntry);
  });

  timeline.forEach((bucket) => {
    bucket.averageOrderValue =
      bucket.orders > 0 ? bucket.revenue / bucket.orders : 0;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce(
    (sum, order) => sum + getOrderItemsCount(order),
    0,
  );
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => isUserActive(user)).length;
  const totalProducts = products.length;
  const inventoryUnits = products.reduce(
    (sum, product) => sum + toFiniteNumber(product.quantity),
    0,
  );
  const uniqueCustomers = new Set(
    orders.map((order) => String(order.user_id || getOrderUserName(order))),
  ).size;
  const totalConversations = conversations.length;
  const unreadMessages = conversations.reduce(
    (sum, conversation) =>
      sum +
      toFiniteNumber(conversation.unread_count ?? conversation.unreadCount),
    0,
  );
  const deliveredOrders = orderStatusMap.get("delivered")?.value || 0;
  const processingOrders = orderStatusMap.get("processing")?.value || 0;
  const pendingOrders = orderStatusMap.get("pending")?.value || 0;
  const cancelledOrders = orderStatusMap.get("cancelled")?.value || 0;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalItemsSold,
      totalUsers,
      activeUsers,
      totalProducts,
      inventoryUnits,
      uniqueCustomers,
      totalConversations,
      unreadMessages,
      deliveredOrders,
      processingOrders,
      pendingOrders,
      cancelledOrders,
    },
    timeline,
    orderStatus: ["delivered", "processing", "pending", "cancelled"]
      .map((key) => orderStatusMap.get(key))
      .filter((entry): entry is AdminBreakdownRow => Boolean(entry)),
    paymentMethods: [...paymentMethodMap.values()].sort(
      (left, right) => right.value - left.value,
    ),
    productCategories: [...productCategoryMap.values()].sort(
      (left, right) => right.inventory - left.inventory,
    ),
    topCustomers: [...topCustomerMap.values()]
      .sort((left, right) => right.spend - left.spend)
      .slice(0, 6),
    userStatus: ["active", "inactive"]
      .map((key) => userStatusMap.get(key))
      .filter((entry): entry is AdminBreakdownRow => Boolean(entry)),
  };
};

export const getAdminAnalyticsDelta = (values: number[]) => {
  if (values.length < 2) return 0;

  const current = values[values.length - 1];
  const previous = values[values.length - 2];

  if (!previous && !current) return 0;
  if (!previous) return 100;

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getTopActiveCustomer = (users: AdminUserRecord[]) => {
  if (!users.length) return "N/A";

  const [topUser] = [...users].sort((left, right) => {
    const leftSpent = toFiniteNumber(left.total_spent ?? left.amount_spent);
    const rightSpent = toFiniteNumber(right.total_spent ?? right.amount_spent);

    if (rightSpent !== leftSpent) {
      return rightSpent - leftSpent;
    }

    return (
      toFiniteNumber(right.orders_count ?? right.orders) -
      toFiniteNumber(left.orders_count ?? left.orders)
    );
  });

  return getUserDisplayName(topUser);
};
