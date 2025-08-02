/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import type {
  Table,
  MenuItem,
  Order,
  KitchenTicket,
  Ingredient,
  RestaurantSettings,
  RestaurantStats,
  UserRole,
  RestaurantUser,
  Payment,
  RestaurantReport,
} from "@/src/types/restaurant";

interface RestaurantContextType {
  // Tables
  tables: Table[];
  zones: string[];
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  updateTableStatus: (tableId: string, status: Table["status"]) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Orders
  orders: Order[];
  activeOrders: Order[];
  createOrder: (tableId: string, waiterId: string) => string;
  addItemToOrder: (orderId: string, item: any) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  // Kitchen
  kitchenTickets: KitchenTicket[];
  updateTicketStatus: (
    ticketId: string,
    status: KitchenTicket["status"]
  ) => void;

  // Inventory
  ingredients: Ingredient[];
  updateIngredientStock: (id: string, stock: number) => void;

  // Settings
  settings: RestaurantSettings;
  updateSettings: (settings: Partial<RestaurantSettings>) => void;

  // Stats
  stats: RestaurantStats;

  // Users & Roles
  users: RestaurantUser[];
  roles: UserRole[];

  // Payments
  payments: Payment[];
  processPayment: (
    orderId: string,
    payment: Omit<Payment, "id" | "createdAt">
  ) => void;

  // Reports
  generateReport: (period: string) => RestaurantReport;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

// Dummy data
const dummyTables: Table[] = [
  { id: "1", number: 1, zone: "Indoor", capacity: 2, status: "Available" },
  {
    id: "2",
    number: 2,
    zone: "Indoor",
    capacity: 4,
    status: "Occupied",
    currentOrderId: "1",
  },
  {
    id: "3",
    number: 3,
    zone: "Indoor",
    capacity: 6,
    status: "Reserved",
    reservedBy: "John Doe",
  },
  { id: "4", number: 4, zone: "Outdoor", capacity: 4, status: "Available" },
  { id: "5", number: 5, zone: "Outdoor", capacity: 2, status: "Cleaning" },
  { id: "6", number: 6, zone: "VIP", capacity: 8, status: "Available" },
];

const dummyMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Chicken Burger",
    description: "Grilled chicken with lettuce, tomato, and mayo",
    price: 15000,
    category: "Food",
    available: true,
    preparationTime: 15,
    ingredients: ["chicken", "bun", "lettuce", "tomato", "mayo"],
    modifiers: [
      { id: "1", name: "Extra Cheese", price: 2000, type: "add" },
      { id: "2", name: "No Mayo", price: 0, type: "remove" },
    ],
  },
  {
    id: "2",
    name: "Beef Pizza",
    description: "Thin crust pizza with beef, cheese, and vegetables",
    price: 25000,
    category: "Food",
    available: true,
    preparationTime: 20,
    ingredients: ["dough", "beef", "cheese", "tomato sauce"],
    modifiers: [
      { id: "3", name: "Extra Beef", price: 5000, type: "add" },
      { id: "4", name: "Thin Crust", price: 0, type: "replace" },
    ],
  },
  {
    id: "3",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 8000,
    category: "Drinks",
    available: true,
    preparationTime: 5,
    ingredients: ["oranges", "ice"],
    modifiers: [
      { id: "5", name: "No Ice", price: 0, type: "remove" },
      { id: "6", name: "Extra Pulp", price: 1000, type: "add" },
    ],
  },
  {
    id: "4",
    name: "French Fries",
    description: "Crispy golden french fries",
    price: 6000,
    category: "Sides",
    available: true,
    preparationTime: 10,
    ingredients: ["potatoes", "oil", "salt"],
    modifiers: [
      { id: "7", name: "Large Size", price: 2000, type: "add" },
      { id: "8", name: "No Salt", price: 0, type: "remove" },
    ],
  },
];

const dummyOrders: Order[] = [
  {
    id: "1",
    tableId: "2",
    table: dummyTables[1],
    items: [
      {
        id: "1",
        menuItemId: "1",
        menuItem: dummyMenuItems[0],
        quantity: 2,
        modifiers: [
          { id: "1", name: "Extra Cheese", price: 2000, type: "add" },
        ],
        status: "Preparing",
        price: 34000,
      },
    ],
    status: "Preparing",
    waiterId: "1",
    waiterName: "Alice Johnson",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtotal: 34000,
    tax: 6120,
    serviceCharge: 3400,
    discount: 0,
    total: 43520,
  },
];

const dummyIngredients: Ingredient[] = [
  {
    id: "1",
    name: "Chicken Breast",
    unit: "kg",
    currentStock: 15,
    minStock: 5,
    maxStock: 50,
    cost: 12000,
  },
  {
    id: "2",
    name: "Beef Mince",
    unit: "kg",
    currentStock: 8,
    minStock: 3,
    maxStock: 30,
    cost: 15000,
  },
  {
    id: "3",
    name: "Cheese",
    unit: "kg",
    currentStock: 3,
    minStock: 2,
    maxStock: 20,
    cost: 8000,
  },
  {
    id: "4",
    name: "Tomatoes",
    unit: "kg",
    currentStock: 12,
    minStock: 5,
    maxStock: 25,
    cost: 3000,
  },
];

const dummySettings: RestaurantSettings = {
  id: "1",
  restaurantName: "SimuPOS Restaurant",
  vatRate: 18,
  serviceChargeRate: 10,
  openTime: "08:00",
  closeTime: "22:00",
  currency: "UGX",
  timezone: "Africa/Kampala",
};

const dummyStats: RestaurantStats = {
  todayOrders: 45,
  todayRevenue: 1250000,
  activeTables: 8,
  pendingOrders: 3,
  completedOrders: 42,
  averageOrderValue: 27778,
};

const dummyRoles: UserRole[] = [
  { id: "1", name: "Admin", permissions: ["all"] },
  { id: "2", name: "Waiter", permissions: ["orders", "tables"] },
  { id: "3", name: "Kitchen", permissions: ["kitchen"] },
  { id: "4", name: "Cashier", permissions: ["orders", "checkout"] },
];

const dummyUsers: RestaurantUser[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@restaurant.com",
    role: dummyRoles[1],
    isActive: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@restaurant.com",
    role: dummyRoles[2],
    isActive: true,
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@restaurant.com",
    role: dummyRoles[3],
    isActive: true,
  },
];

export function RestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tables, setTables] = useState<Table[]>(dummyTables);
  const [currentZone, setCurrentZone] = useState<string>("Indoor");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(dummyMenuItems);
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(dummyIngredients);
  const [settings, setSettings] = useState<RestaurantSettings>(dummySettings);
  const [stats, setStats] = useState<RestaurantStats>(dummyStats);
  const [users] = useState<RestaurantUser[]>(dummyUsers);
  const [roles] = useState<UserRole[]>(dummyRoles);
  const [payments, setPayments] = useState<Payment[]>([]);

  const zones = ["Indoor", "Outdoor", "VIP"];
  const activeOrders = orders.filter(
    (order) => order.status !== "Completed" && order.status !== "Cancelled"
  );

  const updateTableStatus = (tableId: string, status: Table["status"]) => {
    setTables((prev) =>
      prev.map((table) => (table.id === tableId ? { ...table, status } : table))
    );
  };

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((menuItem) =>
        menuItem.id === id ? { ...menuItem, ...item } : menuItem
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const createOrder = (tableId: string, waiterId: string): string => {
    const table = tables.find((t) => t.id === tableId);
    const waiter = users.find((u) => u.id === waiterId);

    if (!table || !waiter) return "";

    const newOrder: Order = {
      id: Date.now().toString(),
      tableId,
      table,
      items: [],
      status: "Open",
      waiterId,
      waiterName: waiter.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      discount: 0,
      total: 0,
    };

    setOrders((prev) => [...prev, newOrder]);
    updateTableStatus(tableId, "Occupied");

    return newOrder.id;
  };

  const addItemToOrder = (orderId: string, item: any) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newItems = [...order.items, item];
          const subtotal = newItems.reduce((sum, item) => sum + item.price, 0);
          const tax = subtotal * (settings.vatRate / 100);
          const serviceCharge = subtotal * (settings.serviceChargeRate / 100);
          const total = subtotal + tax + serviceCharge;

          return {
            ...order,
            items: newItems,
            subtotal,
            tax,
            serviceCharge,
            total,
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );

    if (status === "Completed") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        updateTableStatus(order.tableId, "Available");
      }
    }
  };
  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...updates,
              updatedAt: new Date().toISOString(),
              // Recalculate totals if items were updated
              ...(updates.items
                ? {
                    subtotal: updates.items.reduce(
                      (sum, item) => sum + item.price,
                      0
                    ),
                    tax:
                      updates.items.reduce((sum, item) => sum + item.price, 0) *
                      (settings.vatRate / 100),
                    serviceCharge:
                      updates.items.reduce((sum, item) => sum + item.price, 0) *
                      (settings.serviceChargeRate / 100),
                    total:
                      updates.items.reduce((sum, item) => sum + item.price, 0) *
                      (1 +
                        settings.vatRate / 100 +
                        settings.serviceChargeRate / 100),
                  }
                : {}),
            }
          : order
      )
    );
  };
  const updateTicketStatus = (
    ticketId: string,
    status: KitchenTicket["status"]
  ) => {
    setKitchenTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket
      )
    );
  };

  const updateIngredientStock = (id: string, stock: number) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, currentStock: stock }
          : ingredient
      )
    );
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const processPayment = (
    orderId: string,
    payment: Omit<Payment, "id" | "createdAt">
  ) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);
    updateOrderStatus(orderId, "Completed");
  };

  const generateReport = (period: string): RestaurantReport => {
    const completedOrders = orders.filter(
      (order) => order.status === "Completed"
    );
    const totalSales = completedOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      period,
      totalSales,
      totalOrders,
      averageOrderValue,
      topItems: [],
      tableUtilization: [],
    };
  };

  const value: RestaurantContextType = {
    tables,
    zones,
    currentZone,
    setCurrentZone,
    updateTableStatus,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    activeOrders,
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    updateOrder,
    kitchenTickets,
    updateTicketStatus,
    ingredients,
    updateIngredientStock,
    settings,
    updateSettings,
    stats,
    users,
    roles,
    payments,
    processPayment,
    generateReport,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};

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
