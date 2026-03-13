export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  status: number;
  meta?: PaginationMeta;
}

export interface ApiSingleResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  status: number;
}

export interface AdminUserRecord {
  id: string | number;
  full_name?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  location?: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  orders?: number;
  orders_count?: number;
  amount_spent?: number;
  total_spent?: number;
  profile_image_url?: string;
}

export interface AdminUserDetailsStats {
  total_orders?: number;
  totalOrders?: number;
  total_spent?: number;
  totalSpent?: number;
  average_order_value?: number;
  averageOrderValue?: number;
  total_items_purchased?: number;
  totalItemsPurchased?: number;
  delivered_orders?: number;
  deliveredOrders?: number;
  open_orders?: number;
  openOrders?: number;
  largest_order_value?: number;
  largestOrderValue?: number;
  last_order_at?: string;
  lastOrderAt?: string;
  [key: string]: unknown;
}

export interface AdminOrderItemRecord {
  id: string | number;
  order_id?: string | number;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface AdminOrderRecord {
  id: string | number;
  user_id: string | number;
  status: string;
  total_price?: number;
  total?: number;
  payment_method?: string;
  payment?: string;
  shipping_address?: string;
  shippingAddress?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: AdminOrderItemRecord[];
  user?: AdminUserRecord;
  user_name?: string;
}

export interface AdminUserDetailsRecord {
  user?: AdminUserRecord;
  recent_orders?: AdminOrderRecord[];
  recentOrders?: AdminOrderRecord[];
  orders?: AdminOrderRecord[];
  latest_order?: AdminOrderRecord;
  latestOrder?: AdminOrderRecord;
  stats?: AdminUserDetailsStats;
  order_stats?: AdminUserDetailsStats;
  orderStats?: AdminUserDetailsStats;
  summary?: AdminUserDetailsStats;
  preferred_delivery_address?: string;
  preferredDeliveryAddress?: string;
  latest_payment_method?: string;
  latestPaymentMethod?: string;
  notes?: string | string[];
  highlights?: string | string[];
  [key: string]: unknown;
}

export interface AdminConversationRecord {
  id: string;
  user_id: string | number;
  admin_id?: string | number | null;
  user_name?: string;
  user_email?: string;
  last_message_at?: string;
  lastMessageAt?: string;
  unread_count?: number;
  unreadCount?: number;
  latest_message?: string;
  latestMessage?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminMessageRecord {
  id: string | number;
  conversation_id: string;
  sender_id: string | number;
  receiver_id: string | number;
  content: string;
  is_read?: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface AdminNotificationRecord {
  id: string;
  type: "order" | "message" | "system";
  title: string;
  description: string;
  href?: string;
  created_at?: string;
  createdAt?: string;
  read: boolean;
}

export interface AdminOrderStats {
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  recent_orders?: number;
}
