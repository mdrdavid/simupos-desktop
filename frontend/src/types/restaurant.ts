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

// export interface MenuItem {
//   id: string
//   name: string
//   description: string
//   price: number
//   category: string
//   image?: string
//   isAvailable: boolean
//   preparationTime: number
//   ingredients: string[]
//   allergens: string[]
//   isVegetarian: boolean
//   isVegan: boolean
//   isGlutenFree: boolean
//   calories?: number
// }

// export interface Table {
//   id: string
//   number: number
//   capacity: number
//   status: "Available" | "Occupied" | "Reserved" | "Cleaning"
//   zone: string
//   currentOrder?: string
//   reservedBy?: string
//   reservedTime?: Date
// }

// export interface OrderItem {
//   id: string
//   menuItem: MenuItem
//   quantity: number
//   price: number
//   notes?: string
//   modifications?: string[]
// }

// export interface Order {
//   id: string
//   tableId: string
//   items: OrderItem[]
//   status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Served" | "Completed" | "Cancelled"
//   subtotal: number
//   tax: number
//   serviceCharge: number
//   total: number
//   createdAt: Date
//   updatedAt: Date
//   waiterName: string
//   customerName?: string
//   notes?: string
//   priority: "Low" | "Medium" | "High"
// }

// export interface KitchenTicket {
//   id: string
//   orderId: string
//   tableNumber: number
//   items: OrderItem[]
//   status: "New" | "Preparing" | "Ready"
//   priority: "Low" | "Medium" | "High"
//   estimatedTime: number
//   createdAt: Date
//   notes?: string
// }

// export interface Ingredient {
//   id: string
//   name: string
//   currentStock: number
//   minStock: number
//   maxStock: number
//   unit: string
//   cost: number
//   supplier?: string
//   lastRestocked?: Date
// }

// export interface User {
//   id: string
//   name: string
//   email: string
//   role: Role
//   isActive: boolean
//   createdAt: Date
// }

// export interface Role {
//   id: string
//   name: string
//   permissions: string[]
// }

// export interface RestaurantSettings {
//   restaurantName: string
//   logo?: string
//   openTime: string
//   closeTime: string
//   currency: string
//   vatRate: number
//   serviceChargeRate: number
//   timezone: string
// }

// export interface RestaurantContextType {
//   // Menu
//   menuItems: MenuItem[]
//   addMenuItem: (item: Omit<MenuItem, "id">) => void
//   updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
//   deleteMenuItem: (id: string) => void
//   toggleMenuItemAvailability: (id: string) => void

//   // Tables
//   tables: Table[]
//   updateTableStatus: (id: string, status: Table["status"]) => void
//   assignTableToOrder: (tableId: string, orderId: string) => void

//   // Orders
//   orders: Order[]
//   addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void
//   updateOrderStatus: (id: string, status: Order["status"]) => void
//   updateOrder: (id: string, updates: Partial<Order>) => void
//   deleteOrder: (id: string) => void

//   // Kitchen
//   kitchenTickets: KitchenTicket[]
//   updateTicketStatus: (id: string, status: KitchenTicket["status"]) => void

//   // Inventory
//   ingredients: Ingredient[]
//   updateIngredientStock: (id: string, newStock: number) => void
//   addIngredient: (ingredient: Omit<Ingredient, "id">) => void

//   // Users & Roles
//   users: User[]
//   roles: Role[]
//   addUser: (user: Omit<User, "id" | "createdAt">) => void
//   updateUser: (id: string, updates: Partial<User>) => void

//   // Settings
//   settings: RestaurantSettings
//   updateSettings: (settings: Partial<RestaurantSettings>) => void

//   // Reports
//   generateReport: (type: string, period: string) => any
// }
