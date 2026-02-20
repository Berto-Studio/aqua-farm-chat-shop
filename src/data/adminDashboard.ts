export interface AdminOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  userId: string;
  user: string;
  date: string;
  status: "Delivered" | "Processing" | "Pending" | "Cancelled";
  total: number;
  itemsCount: number;
  payment: "Credit Card" | "PayPal" | "Bank Transfer";
  shippingAddress: string;
  notes?: string;
  items: AdminOrderItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  orders: number;
  spent: number;
  status: "Active" | "Inactive";
  joined: string;
  conversationId?: string;
}

export const adminUsers: AdminUser[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (212) 555-0121",
    location: "New York, USA",
    orders: 5,
    spent: 325.75,
    status: "Active",
    joined: "2025-01-15",
    conversationId: "conv-1",
  },
  {
    id: "USR-002",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "+1 (310) 555-0102",
    location: "Los Angeles, USA",
    orders: 3,
    spent: 175.5,
    status: "Active",
    joined: "2025-02-10",
    conversationId: "conv-2",
  },
  {
    id: "USR-003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "+1 (312) 555-0117",
    location: "Chicago, USA",
    orders: 8,
    spent: 510.25,
    status: "Active",
    joined: "2025-03-20",
  },
  {
    id: "USR-004",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    phone: "+1 (305) 555-0193",
    location: "Miami, USA",
    orders: 1,
    spent: 62.75,
    status: "Inactive",
    joined: "2025-04-05",
  },
  {
    id: "USR-005",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (737) 555-0160",
    location: "Austin, USA",
    orders: 2,
    spent: 150,
    status: "Active",
    joined: "2025-05-01",
  },
];

export const adminOrders: AdminOrder[] = [
  {
    id: "ORD-001",
    userId: "USR-001",
    user: "John Doe",
    date: "2025-05-10",
    status: "Delivered",
    total: 125.99,
    itemsCount: 3,
    payment: "Credit Card",
    shippingAddress: "295 Madison Ave, New York, NY, USA",
    notes: "Leave package at front desk.",
    items: [
      { id: "ORD-001-1", productName: "CatFish Fingerlings Pack", quantity: 2, unitPrice: 25.99 },
      { id: "ORD-001-2", productName: "Solar Pond Aerator Pump", quantity: 1, unitPrice: 74.01 },
    ],
  },
  {
    id: "ORD-002",
    userId: "USR-002",
    user: "Sarah Smith",
    date: "2025-05-09",
    status: "Processing",
    total: 75.5,
    itemsCount: 1,
    payment: "PayPal",
    shippingAddress: "1100 S Flower St, Los Angeles, CA, USA",
    items: [
      { id: "ORD-002-1", productName: "Mature Tilapia", quantity: 1, unitPrice: 75.5 },
    ],
  },
  {
    id: "ORD-003",
    userId: "USR-003",
    user: "Robert Johnson",
    date: "2025-05-08",
    status: "Pending",
    total: 210.25,
    itemsCount: 5,
    payment: "Bank Transfer",
    shippingAddress: "450 N Cityfront Plaza Dr, Chicago, IL, USA",
    notes: "User requested morning delivery.",
    items: [
      { id: "ORD-003-1", productName: "Broiler Chickens", quantity: 5, unitPrice: 42.05 },
    ],
  },
  {
    id: "ORD-004",
    userId: "USR-004",
    user: "Lisa Anderson",
    date: "2025-05-07",
    status: "Delivered",
    total: 62.75,
    itemsCount: 2,
    payment: "Credit Card",
    shippingAddress: "200 Biscayne Blvd, Miami, FL, USA",
    items: [
      { id: "ORD-004-1", productName: "Fresh Cucumbers", quantity: 5, unitPrice: 12.55 },
    ],
  },
  {
    id: "ORD-005",
    userId: "USR-005",
    user: "Michael Brown",
    date: "2025-05-06",
    status: "Cancelled",
    total: 150,
    itemsCount: 4,
    payment: "PayPal",
    shippingAddress: "600 Congress Ave, Austin, TX, USA",
    notes: "Order cancelled by user before shipment.",
    items: [
      { id: "ORD-005-1", productName: "Dairy Goats", quantity: 1, unitPrice: 150 },
    ],
  },
];

export const getAdminOrderById = (orderId: string) =>
  adminOrders.find((order) => order.id === orderId);

export const getAdminUserById = (userId: string) =>
  adminUsers.find((user) => user.id === userId);

export const getOrdersByUserId = (userId: string) =>
  adminOrders.filter((order) => order.userId === userId);
