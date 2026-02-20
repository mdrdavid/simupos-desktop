export interface Table {
  id: string;
  number: number;
  zone: "Indoor" | "Outdoor" | "VIP";
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  currentOrderId?: string;
  reservedBy?: string;
  reservedAt?: string;
}

export interface Zone {
  id: string;
  name: string;
  tables: Table[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Food" | "Drinks" | "Sides" | "Desserts";
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  modifiers: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  price: number;
  type: "add" | "remove" | "replace";
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  modifiers: MenuModifier[];
  specialInstructions?: string;
  status: "Pending" | "Preparing" | "Ready" | "Served";
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  table: Table;
  items: OrderItem[];
  status:
    | "Open"
    | "Pending"
    | "Confirmed"
    | "Preparing"
    | "Ready"
    | "Served"
    | "Completed"
    | "Cancelled";
  waiterId: string;
  waiterName: string;
  customerName?: string; // Add this line
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  notes?: string;
  priority?: "Low" | "Medium" | "High";
}
export interface KitchenTicket {
  id: string;
  orderId: string;
  tableNumber: number;
  items: OrderItem[];
  priority: "Low" | "Medium" | "High";
  estimatedTime: number;
  createdAt: string;
  status: "New" | "Preparing" | "Ready";
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  cost: number;
  supplier?: string;
  lastRestocked?: string;
}

export interface RestaurantSettings {
  id: string;
  restaurantName: string;
  logo?: string;
  vatRate: number;
  serviceChargeRate: number;
  openTime: string;
  closeTime: string;
  currency: string;
  timezone: string;
}

export interface RestaurantStats {
  todayOrders: number;
  todayRevenue: number;
  activeTables: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface RestaurantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  method: "Cash" | "Mobile Money" | "Card" | "Split";
  amount: number;
  tip: number;
  createdAt: string;
}

export interface RestaurantReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topItems: Array<{
    item: MenuItem;
    quantity: number;
    revenue: number;
  }>;
  tableUtilization: Array<{
    table: Table;
    ordersCount: number;
    revenue: number;
  }>;
}
