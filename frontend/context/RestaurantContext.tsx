/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  OrderItem,
  Zone,
  MenuModifier,
} from "@/src/types/restaurant";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";

interface RestaurantContextType {
  // State
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  kitchenTickets: KitchenTicket[];
  ingredients: Ingredient[];
  settings: RestaurantSettings;
  stats: RestaurantStats;
  users: RestaurantUser[];
  roles: UserRole[];
  payments: Payment[];
  zones: Zone[];
  currentZone: string;
  activeOrders: Order[];
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentZone: (zone: string) => void;

  // Tables
  fetchTables: () => Promise<void>;
  getTableById: (id: string) => Promise<Table>;
  createTable: (
    table: Omit<
      Table,
      "id" | "createdAt" | "updatedAt" | "isDeleted" | "orders"
    >
  ) => Promise<Table>;
  updateTableStatus: (
    tableId: string,
    status: Table["status"],
    reservedBy?: string
  ) => Promise<Table>;
  updateTable: (tableId: string, updates: Partial<Table>) => Promise<Table>;
  deleteTable: (tableId: string) => Promise<void>;
  getTablesWithOrders: () => Promise<Table[]>;

  // Menu Items
  fetchMenuItems: () => Promise<void>;
  getMenuItemById: (id: string) => Promise<MenuItem>;
  createMenuItem: (
    menuItem: Omit<
      MenuItem,
      "id" | "createdAt" | "updatedAt" | "isDeleted" | "orderItems" | "branchId"
    >
  ) => Promise<MenuItem>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  getMenuItemsWithIngredients: () => Promise<MenuItem[]>;

  // Orders
  fetchOrders: (filters?: any) => Promise<void>;
  getActiveOrders: () => Promise<Order[]>;
  getOrderWithDetails: (orderId: string) => Promise<Order>;
  createOrder: (
    tableId: string,
    waiterId: string,
    waiterName: string,
    customerName?: string
  ) => Promise<Order>;
  addItemToOrder: (
    orderId: string,
    menuItemId: string,
    quantity: number,
    modifiers?: MenuModifier[],
    specialInstructions?: string
  ) => Promise<OrderItem>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<Order>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  updateOrderItemStatus: (
    orderItemId: string,
    status: OrderItem["status"]
  ) => Promise<OrderItem>;

  // Kitchen
  fetchKitchenTickets: () => Promise<void>;
  updateTicketStatus: (
    ticketId: string,
    status: KitchenTicket["status"]
  ) => Promise<KitchenTicket>;

  // Ingredients
  fetchIngredients: () => Promise<void>;
  getIngredientById: (id: string) => Promise<Ingredient>;
  createIngredient: (
    ingredient: Omit<
      Ingredient,
      "id" | "createdAt" | "updatedAt" | "isDeleted" | "branchId"
    >
  ) => Promise<Ingredient>;
  updateIngredient: (
    id: string,
    updates: Partial<Ingredient>
  ) => Promise<Ingredient>;
  updateIngredientStock: (
    id: string,
    currentStock: number
  ) => Promise<Ingredient>;
  deleteIngredient: (id: string) => Promise<void>;
  getLowStockIngredients: () => Promise<Ingredient[]>;

  // Settings
  fetchSettings: () => Promise<void>;
  updateSettings: (
    updates: Partial<RestaurantSettings>
  ) => Promise<RestaurantSettings>;

  // Stats
  fetchStats: () => Promise<void>;
  getBranchRestaurantStats: (period?: {
    start?: Date;
    end?: Date;
  }) => Promise<any>;

  // Payments
  fetchPayments: () => Promise<void>;
  processPayment: (
    orderId: string,
    payment: Omit<Payment, "id" | "createdAt" | "branchId" | "orderId">
  ) => Promise<Payment>;
  getOrderPayments: (orderId: string) => Promise<Payment[]>;

  // Reports
  generateRestaurantReport: (period: string) => Promise<RestaurantReport>;

  // Utility
  reloadData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

// Default settings
const defaultSettings: RestaurantSettings = {
  id: "",
  restaurantName: "SimuPOS Restaurant",
  vatRate: 18,
  serviceChargeRate: 10,
  openTime: "08:00",
  closeTime: "22:00",
  currency: "UGX",
  timezone: "Africa/Kampala",
};

// Default stats
const defaultStats: RestaurantStats = {
  todayOrders: 0,
  todayRevenue: 0,
  activeTables: 0,
  pendingOrders: 0,
  completedOrders: 0,
  averageOrderValue: 0,
};

interface RestaurantProviderProps {
  children: React.ReactNode;
}

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const { currentBranchId, getAuthHeaders } = useAuth();

  // State
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [stats, setStats] = useState<RestaurantStats>(defaultStats);
  const [users, setUsers] = useState<RestaurantUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [zones, setZones] = useState<Zone[]>([
    { id: "1", name: "Indoor", tables: [] },
    { id: "2", name: "Outdoor", tables: [] },
    { id: "3", name: "VIP", tables: [] },
  ]);
  const [currentZone, setCurrentZone] = useState<string>("Indoor");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const activeOrders = orders.filter(
    (order) => order.status !== "Completed" && order.status !== "Cancelled"
  );

  // Load initial data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      loadInitialData();
    }
  }, [currentBranchId]);

  const loadInitialData = useCallback(async () => {
    if (!currentBranchId) return;

    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      await Promise.all([
        fetchTables(),
        fetchMenuItems(),
        fetchOrders(),
        fetchKitchenTickets(),
        fetchIngredients(),
        fetchStats(),
        fetchSettings(),
        fetchPayments(),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant data");
      console.error("Error loading restaurant data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranchId]);

  // ==================== TABLE FUNCTIONS ====================

  const fetchTables = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/tables`,
        { headers }
      );
      setTables(response.data || []);

      // Update zones with actual tables
      const indoorTables =
        response.data?.filter((table: Table) => table.zone === "Indoor") || [];
      const outdoorTables =
        response.data?.filter((table: Table) => table.zone === "Outdoor") || [];
      const vipTables =
        response.data?.filter((table: Table) => table.zone === "VIP") || [];

      setZones([
        { id: "1", name: "Indoor", tables: indoorTables },
        { id: "2", name: "Outdoor", tables: outdoorTables },
        { id: "3", name: "VIP", tables: vipTables },
      ]);
    } catch (err: any) {
      console.error("Error fetching tables:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getTablesWithOrders = useCallback(async (): Promise<Table[]> => {
    if (!currentBranchId) return [];
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/tables/with-orders`,
        { headers }
      );
      return response.data || [];
    } catch (err: any) {
      console.error("Error fetching tables with orders:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getTableById = useCallback(
    async (id: string): Promise<Table> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/tables/${id}`,
          { headers }
        );
        return response.data;
      } catch (err: any) {
        console.error("Error fetching table:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const createTable = useCallback(
    async (
      table: Omit<
        Table,
        "id" | "createdAt" | "updatedAt" | "isDeleted" | "orders"
      >
    ): Promise<Table> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/tables`,
          {
            method: "POST",
            body: JSON.stringify(table),
            headers,
          }
        );

        // Update local state
        setTables((prev) => [...prev, response.data]);

        // Update zones
        setZones((prev) =>
          prev.map((zone) =>
            zone.name === response.data.zone
              ? { ...zone, tables: [...zone.tables, response.data] }
              : zone
          )
        );

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to create table");
        console.error("Error creating table:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateTableStatus = useCallback(
    async (
      tableId: string,
      status: Table["status"],
      reservedBy?: string
    ): Promise<Table> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/tables/${tableId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status, reservedBy }),
            headers,
          }
        );

        // Update local state
        setTables((prev) =>
          prev.map((table) =>
            table.id === tableId ? { ...table, ...response.data } : table
          )
        );

        // Update zones
        setZones((prev) =>
          prev.map((zone) => ({
            ...zone,
            tables: zone.tables.map((table) =>
              table.id === tableId ? { ...table, ...response.data } : table
            ),
          }))
        );

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update table status");
        console.error("Error updating table status:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateTable = useCallback(
    async (tableId: string, updates: Partial<Table>): Promise<Table> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/tables/${tableId}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );

        // Update local state
        setTables((prev) =>
          prev.map((table) =>
            table.id === tableId ? { ...table, ...response.data } : table
          )
        );

        // Update zones
        setZones((prev) =>
          prev.map((zone) => ({
            ...zone,
            tables: zone.tables.map((table) =>
              table.id === tableId ? { ...table, ...response.data } : table
            ),
          }))
        );

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update table");
        console.error("Error updating table:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const deleteTable = useCallback(
    async (tableId: string): Promise<void> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(
          `/restaurant/branches/${currentBranchId}/tables/${tableId}`,
          {
            method: "DELETE",
            headers,
          }
        );

        // Update local state
        setTables((prev) => prev.filter((table) => table.id !== tableId));

        // Update zones
        setZones((prev) =>
          prev.map((zone) => ({
            ...zone,
            tables: zone.tables.filter((table) => table.id !== tableId),
          }))
        );

        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete table");
        console.error("Error deleting table:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== MENU ITEM FUNCTIONS ====================

  const fetchMenuItems = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/menu-items`,
        { headers }
      );
      setMenuItems(response.data || []);
    } catch (err: any) {
      console.error("Error fetching menu items:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getMenuItemsWithIngredients = useCallback(async (): Promise<
    MenuItem[]
  > => {
    if (!currentBranchId) return [];
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/menu-items/with-ingredients`,
        { headers }
      );
      return response.data || [];
    } catch (err: any) {
      console.error("Error fetching menu items with ingredients:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getMenuItemById = useCallback(
    async (id: string): Promise<MenuItem> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/menu-items/${id}`,
          { headers }
        );
        return response.data;
      } catch (err: any) {
        console.error("Error fetching menu item:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const createMenuItem = useCallback(
    async (
      menuItem: Omit<
        MenuItem,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "isDeleted"
        | "orderItems"
        | "branchId"
      >
    ): Promise<MenuItem> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/menu-items`,
          {
            method: "POST",
            body: JSON.stringify(menuItem),
            headers,
          }
        );

        // Update local state
        setMenuItems((prev) => [...prev, response.data]);
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to create menu item");
        console.error("Error creating menu item:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateMenuItem = useCallback(
    async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/menu-items/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );

        // Update local state
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...response.data } : item
          )
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update menu item");
        console.error("Error updating menu item:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const deleteMenuItem = useCallback(
    async (id: string): Promise<void> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(
          `/restaurant/branches/${currentBranchId}/menu-items/${id}`,
          {
            method: "DELETE",
            headers,
          }
        );

        // Update local state
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete menu item");
        console.error("Error deleting menu item:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== ORDER FUNCTIONS ====================

  const fetchOrders = useCallback(
    async (filters?: any) => {
      if (!currentBranchId) return;
      try {
        const headers = await getAuthHeaders();
        let url = `/restaurant/branches/${currentBranchId}/orders`;

        if (filters) {
          const params = new URLSearchParams();
          if (filters.status) params.append("status", filters.status);
          if (filters.tableId) params.append("tableId", filters.tableId);
          if (filters.waiterId) params.append("waiterId", filters.waiterId);
          if (filters.startDate)
            params.append("startDate", filters.startDate.toISOString());
          if (filters.endDate)
            params.append("endDate", filters.endDate.toISOString());

          if (params.toString()) {
            url += `?${params.toString()}`;
          }
        }

        const response = await httpClient(url, { headers });
        setOrders(response.data || []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getActiveOrders = useCallback(async () => {
    if (!currentBranchId) return [];
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/orders/active`,
        { headers }
      );
      return response.data || [];
    } catch (err: any) {
      console.error("Error fetching active orders:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getOrderWithDetails = useCallback(
    async (orderId: string): Promise<Order> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}`,
          { headers }
        );
        return response.data;
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const createOrder = useCallback(
    async (
      tableId: string,
      waiterId: string,
      waiterName: string,
      customerName?: string
    ): Promise<Order> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders`,
          {
            method: "POST",
            body: JSON.stringify({
              tableId,
              waiterId,
              waiterName,
              customerName,
            }),
            headers,
          }
        );

        // Update local state
        setOrders((prev) => [...prev, response.data]);

        // Update table status
        const updatedTable: Table = {
          ...(response.data.table as Table),
          status: "Occupied" as Table["status"],
          currentOrderId: response.data.id,
        };
        setTables((prev) =>
          prev.map((table) => (table.id === tableId ? updatedTable : table))
        );

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to create order");
        console.error("Error creating order:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const addItemToOrder = useCallback(
    async (
      orderId: string,
      menuItemId: string,
      quantity: number,
      modifiers?: MenuModifier[],
      specialInstructions?: string
    ): Promise<OrderItem> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}/items`,
          {
            method: "POST",
            body: JSON.stringify({
              menuItemId,
              quantity,
              modifiers,
              specialInstructions,
            }),
            headers,
          }
        );

        // Refresh orders to get updated totals
        await fetchOrders();
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to add item to order");
        console.error("Error adding item to order:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders, fetchOrders]
  );

  // ==================== STATS FUNCTIONS ====================

  const fetchStats = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/restaurant-stats`,
        { headers }
      );

      // Ensure all values are numbers
      const safeStats = {
        todayOrders: Number(response.data?.todayOrders) || 0,
        todayRevenue: Number(response.data?.todayRevenue) || 0,
        activeTables: Number(response.data?.activeTables) || 0,
        pendingOrders: Number(response.data?.pendingOrders) || 0,
        completedOrders: Number(response.data?.completedOrders) || 0,
        averageOrderValue: Number(response.data?.averageOrderValue) || 0,
      };

      setStats(safeStats);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      // Set safe defaults
      setStats(defaultStats);
    }
  }, [currentBranchId, getAuthHeaders]);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]): Promise<Order> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
          }
        );

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, ...response.data } : order
          )
        );

        // If order is completed or cancelled, free up the table
        if (status === "Completed" || status === "Cancelled") {
          const order = orders.find((o) => o.id === orderId);
          if (order) {
            const updatedTable: Table = {
              ...(order.table as Table),
              status: "Available" as Table["status"],
              currentOrderId: undefined,
            };
            setTables((prev) =>
              prev.map((table) =>
                table.id === order.tableId ? updatedTable : table
              )
            );
          }
        }

        // Refresh stats
        await fetchStats();

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update order status");
        console.error("Error updating order status:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders, orders, fetchStats]
  );

  const updateOrderItemStatus = useCallback(
    async (
      orderItemId: string,
      status: OrderItem["status"]
    ): Promise<OrderItem> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/order-items/${orderItemId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
          }
        );

        // Refresh orders to get updated item status
        await fetchOrders();
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update order item status");
        console.error("Error updating order item status:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders, fetchOrders]
  );

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>): Promise<Order> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, ...response.data } : order
          )
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update order");
        console.error("Error updating order:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const cancelOrder = useCallback(
    async (orderId: string): Promise<Order> => {
      return updateOrderStatus(orderId, "Cancelled");
    },
    [updateOrderStatus]
  );

  // ==================== KITCHEN FUNCTIONS ====================

  const fetchKitchenTickets = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/kitchen-tickets`,
        { headers }
      );
      setKitchenTickets(response.data || []);
    } catch (err: any) {
      console.error("Error fetching kitchen tickets:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const updateTicketStatus = useCallback(
    async (
      ticketId: string,
      status: KitchenTicket["status"]
    ): Promise<KitchenTicket> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/kitchen-tickets/${ticketId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
          }
        );

        // Update local state
        setKitchenTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, ...response.data } : ticket
          )
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update ticket status");
        console.error("Error updating ticket status:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== INGREDIENT FUNCTIONS ====================

  const fetchIngredients = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/ingredients`,
        { headers }
      );
      setIngredients(response.data || []);
    } catch (err: any) {
      console.error("Error fetching ingredients:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  const getIngredientById = useCallback(
    async (id: string): Promise<Ingredient> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/ingredients/${id}`,
          { headers }
        );
        return response.data;
      } catch (err: any) {
        console.error("Error fetching ingredient:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const createIngredient = useCallback(
    async (
      ingredient: Omit<
        Ingredient,
        "id" | "createdAt" | "updatedAt" | "isDeleted" | "branchId"
      >
    ): Promise<Ingredient> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/ingredients`,
          {
            method: "POST",
            body: JSON.stringify(ingredient),
            headers,
          }
        );

        // Update local state
        setIngredients((prev) => [...prev, response.data]);
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to create ingredient");
        console.error("Error creating ingredient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateIngredient = useCallback(
    async (id: string, updates: Partial<Ingredient>): Promise<Ingredient> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/ingredients/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );

        // Update local state
        setIngredients((prev) =>
          prev.map((ingredient) =>
            ingredient.id === id
              ? { ...ingredient, ...response.data }
              : ingredient
          )
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update ingredient");
        console.error("Error updating ingredient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const updateIngredientStock = useCallback(
    async (id: string, currentStock: number): Promise<Ingredient> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/ingredients/${id}/stock`,
          {
            method: "PATCH",
            body: JSON.stringify({ currentStock }),
            headers,
          }
        );

        // Update local state
        setIngredients((prev) =>
          prev.map((ingredient) =>
            ingredient.id === id
              ? { ...ingredient, ...response.data }
              : ingredient
          )
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update ingredient stock");
        console.error("Error updating ingredient stock:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const deleteIngredient = useCallback(
    async (id: string): Promise<void> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        await httpClient(
          `/restaurant/branches/${currentBranchId}/ingredients/${id}`,
          {
            method: "DELETE",
            headers,
          }
        );

        // Update local state
        setIngredients((prev) =>
          prev.filter((ingredient) => ingredient.id !== id)
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete ingredient");
        console.error("Error deleting ingredient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const getLowStockIngredients = useCallback(async (): Promise<
    Ingredient[]
  > => {
    if (!currentBranchId) return [];
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/ingredients/low-stock`,
        { headers }
      );
      return response.data || [];
    } catch (err: any) {
      console.error("Error fetching low stock ingredients:", err);
      throw err;
    }
  }, [currentBranchId, getAuthHeaders]);

  // ==================== SETTINGS FUNCTIONS ====================

  const fetchSettings = useCallback(async () => {
    if (!currentBranchId) return;
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/restaurant/branches/${currentBranchId}/restaurant-settings`,
        { headers }
      );
      setSettings(response.data || defaultSettings);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      // Use default settings if fetch fails
    }
  }, [currentBranchId, getAuthHeaders]);

  const updateSettings = useCallback(
    async (
      updates: Partial<RestaurantSettings>
    ): Promise<RestaurantSettings> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/restaurant-settings`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
            headers,
          }
        );
        setSettings(response.data);
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to update settings");
        console.error("Error updating settings:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== STATS FUNCTIONS ====================

  const getBranchRestaurantStats = useCallback(
    async (period?: { start?: Date; end?: Date }): Promise<any> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        let url = `/restaurant/branches/${currentBranchId}/restaurant-stats/period`;

        if (period?.start || period?.end) {
          const params = new URLSearchParams();
          if (period.start)
            params.append("startDate", period.start.toISOString());
          if (period.end) params.append("endDate", period.end.toISOString());

          if (params.toString()) {
            url += `?${params.toString()}`;
          }
        }

        const response = await httpClient(url, { headers });
        return response.data;
      } catch (err: any) {
        console.error("Error fetching branch stats:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== PAYMENT FUNCTIONS ====================

  const fetchPayments = useCallback(async () => {
    // Note: There's no endpoint to get all payments, only order-specific payments
    // We'll need to fetch payments per order
    setPayments([]); // Initialize as empty
  }, []);

  const processPayment = useCallback(
    async (
      orderId: string,
      payment: Omit<Payment, "id" | "createdAt" | "branchId" | "orderId">
    ): Promise<Payment> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}/payments`,
          {
            method: "POST",
            body: JSON.stringify(payment),
            headers,
          }
        );

        // Update order status to completed
        await updateOrderStatus(orderId, "Completed");

        // Refresh stats
        await fetchStats();

        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to process payment");
        console.error("Error processing payment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders, updateOrderStatus, fetchStats]
  );

  const getOrderPayments = useCallback(
    async (orderId: string): Promise<Payment[]> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/orders/${orderId}/payments`,
          { headers }
        );
        return response.data || [];
      } catch (err: any) {
        console.error("Error fetching order payments:", err);
        throw err;
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  // ==================== REPORT FUNCTIONS ====================

  const generateRestaurantReport = useCallback(
    async (period: string): Promise<RestaurantReport> => {
      if (!currentBranchId) throw new Error("No branch selected");
      try {
        setLoading(true);
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/restaurant/branches/${currentBranchId}/reports/restaurant?period=${period}`,
          { headers }
        );
        setError(null);
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to generate report");
        console.error("Error generating report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, getAuthHeaders]
  );

  const value: RestaurantContextType = {
    // State
    tables,
    menuItems,
    orders,
    kitchenTickets,
    ingredients,
    settings,
    stats,
    users,
    roles,
    payments,
    zones,
    currentZone,
    activeOrders,
    loading,
    error,

    // Actions
    setCurrentZone,

    // Tables
    fetchTables,
    getTableById,
    createTable,
    updateTableStatus,
    updateTable,
    deleteTable,
    getTablesWithOrders,

    // Menu Items
    fetchMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemsWithIngredients,

    // Orders
    fetchOrders,
    getOrderWithDetails,
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    updateOrder,
    cancelOrder,
    updateOrderItemStatus,
    getActiveOrders,

    // Kitchen
    fetchKitchenTickets,
    updateTicketStatus,

    // Ingredients
    fetchIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    updateIngredientStock,
    deleteIngredient,
    getLowStockIngredients,

    // Settings
    fetchSettings,
    updateSettings,

    // Stats
    fetchStats,
    getBranchRestaurantStats,

    // Payments
    fetchPayments,
    processPayment,
    getOrderPayments,

    // Reports
    generateRestaurantReport,

    // Utility
    reloadData: loadInitialData,
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


// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import type React from "react";
// import { createContext, useContext, useState } from "react";
// import type {
//   Table,
//   MenuItem,
//   Order,
//   KitchenTicket,
//   Ingredient,
//   RestaurantSettings,
//   RestaurantStats,
//   UserRole,
//   RestaurantUser,
//   Payment,
//   RestaurantReport,
// } from "@/src/types/restaurant";

// interface RestaurantContextType {
//   // Tables
//   tables: Table[];
//   zones: string[];
//   currentZone: string;
//   setCurrentZone: (zone: string) => void;
//   updateTableStatus: (tableId: string, status: Table["status"]) => void;

//   // Menu
//   menuItems: MenuItem[];
//   addMenuItem: (item: Omit<MenuItem, "id">) => void;
//   updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
//   deleteMenuItem: (id: string) => void;

//   // Orders
//   orders: Order[];
//   activeOrders: Order[];
//   createOrder: (tableId: string, waiterId: string) => string;
//   addItemToOrder: (orderId: string, item: any) => void;
//   updateOrderStatus: (orderId: string, status: Order["status"]) => void;
//   updateOrder: (orderId: string, updates: Partial<Order>) => void;
//   // Kitchen
//   kitchenTickets: KitchenTicket[];
//   updateTicketStatus: (
//     ticketId: string,
//     status: KitchenTicket["status"]
//   ) => void;

//   // Inventory
//   ingredients: Ingredient[];
//   updateIngredientStock: (id: string, stock: number) => void;

//   // Settings
//   settings: RestaurantSettings;
//   updateSettings: (settings: Partial<RestaurantSettings>) => void;

//   // Stats
//   stats: RestaurantStats;

//   // Users & Roles
//   users: RestaurantUser[];
//   roles: UserRole[];

//   // Payments
//   payments: Payment[];
//   processPayment: (
//     orderId: string,
//     payment: Omit<Payment, "id" | "createdAt">
//   ) => void;

//   // Reports
//   generateReport: (period: string) => RestaurantReport;
// }

// const RestaurantContext = createContext<RestaurantContextType | undefined>(
//   undefined
// );

// // Dummy data
// const dummyTables: Table[] = [
//   { id: "1", number: 1, zone: "Indoor", capacity: 2, status: "Available" },
//   {
//     id: "2",
//     number: 2,
//     zone: "Indoor",
//     capacity: 4,
//     status: "Occupied",
//     currentOrderId: "1",
//   },
//   {
//     id: "3",
//     number: 3,
//     zone: "Indoor",
//     capacity: 6,
//     status: "Reserved",
//     reservedBy: "John Doe",
//   },
//   { id: "4", number: 4, zone: "Outdoor", capacity: 4, status: "Available" },
//   { id: "5", number: 5, zone: "Outdoor", capacity: 2, status: "Cleaning" },
//   { id: "6", number: 6, zone: "VIP", capacity: 8, status: "Available" },
// ];

// const dummyMenuItems: MenuItem[] = [
//   {
//     id: "1",
//     name: "Chicken Burger",
//     description: "Grilled chicken with lettuce, tomato, and mayo",
//     price: 15000,
//     category: "Food",
//     available: true,
//     preparationTime: 15,
//     ingredients: ["chicken", "bun", "lettuce", "tomato", "mayo"],
//     modifiers: [
//       { id: "1", name: "Extra Cheese", price: 2000, type: "add" },
//       { id: "2", name: "No Mayo", price: 0, type: "remove" },
//     ],
//   },
//   {
//     id: "2",
//     name: "Beef Pizza",
//     description: "Thin crust pizza with beef, cheese, and vegetables",
//     price: 25000,
//     category: "Food",
//     available: true,
//     preparationTime: 20,
//     ingredients: ["dough", "beef", "cheese", "tomato sauce"],
//     modifiers: [
//       { id: "3", name: "Extra Beef", price: 5000, type: "add" },
//       { id: "4", name: "Thin Crust", price: 0, type: "replace" },
//     ],
//   },
//   {
//     id: "3",
//     name: "Fresh Orange Juice",
//     description: "Freshly squeezed orange juice",
//     price: 8000,
//     category: "Drinks",
//     available: true,
//     preparationTime: 5,
//     ingredients: ["oranges", "ice"],
//     modifiers: [
//       { id: "5", name: "No Ice", price: 0, type: "remove" },
//       { id: "6", name: "Extra Pulp", price: 1000, type: "add" },
//     ],
//   },
//   {
//     id: "4",
//     name: "French Fries",
//     description: "Crispy golden french fries",
//     price: 6000,
//     category: "Sides",
//     available: true,
//     preparationTime: 10,
//     ingredients: ["potatoes", "oil", "salt"],
//     modifiers: [
//       { id: "7", name: "Large Size", price: 2000, type: "add" },
//       { id: "8", name: "No Salt", price: 0, type: "remove" },
//     ],
//   },
// ];

// const dummyOrders: Order[] = [
//   {
//     id: "1",
//     tableId: "2",
//     table: dummyTables[1],
//     items: [
//       {
//         id: "1",
//         menuItemId: "1",
//         menuItem: dummyMenuItems[0],
//         quantity: 2,
//         modifiers: [
//           { id: "1", name: "Extra Cheese", price: 2000, type: "add" },
//         ],
//         status: "Preparing",
//         price: 34000,
//       },
//     ],
//     status: "Preparing",
//     waiterId: "1",
//     waiterName: "Alice Johnson",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     subtotal: 34000,
//     tax: 6120,
//     serviceCharge: 3400,
//     discount: 0,
//     total: 43520,
//   },
// ];

// const dummyIngredients: Ingredient[] = [
//   {
//     id: "1",
//     name: "Chicken Breast",
//     unit: "kg",
//     currentStock: 15,
//     minStock: 5,
//     maxStock: 50,
//     cost: 12000,
//   },
//   {
//     id: "2",
//     name: "Beef Mince",
//     unit: "kg",
//     currentStock: 8,
//     minStock: 3,
//     maxStock: 30,
//     cost: 15000,
//   },
//   {
//     id: "3",
//     name: "Cheese",
//     unit: "kg",
//     currentStock: 3,
//     minStock: 2,
//     maxStock: 20,
//     cost: 8000,
//   },
//   {
//     id: "4",
//     name: "Tomatoes",
//     unit: "kg",
//     currentStock: 12,
//     minStock: 5,
//     maxStock: 25,
//     cost: 3000,
//   },
// ];

// const dummySettings: RestaurantSettings = {
//   id: "1",
//   restaurantName: "SimuPOS Restaurant",
//   vatRate: 18,
//   serviceChargeRate: 10,
//   openTime: "08:00",
//   closeTime: "22:00",
//   currency: "UGX",
//   timezone: "Africa/Kampala",
// };

// const dummyStats: RestaurantStats = {
//   todayOrders: 45,
//   todayRevenue: 1250000,
//   activeTables: 8,
//   pendingOrders: 3,
//   completedOrders: 42,
//   averageOrderValue: 27778,
// };

// const dummyRoles: UserRole[] = [
//   { id: "1", name: "Admin", permissions: ["all"] },
//   { id: "2", name: "Waiter", permissions: ["orders", "tables"] },
//   { id: "3", name: "Kitchen", permissions: ["kitchen"] },
//   { id: "4", name: "Cashier", permissions: ["orders", "checkout"] },
// ];

// const dummyUsers: RestaurantUser[] = [
//   {
//     id: "1",
//     name: "Alice Johnson",
//     email: "alice@restaurant.com",
//     role: dummyRoles[1],
//     isActive: true,
//   },
//   {
//     id: "2",
//     name: "Bob Smith",
//     email: "bob@restaurant.com",
//     role: dummyRoles[2],
//     isActive: true,
//   },
//   {
//     id: "3",
//     name: "Carol Davis",
//     email: "carol@restaurant.com",
//     role: dummyRoles[3],
//     isActive: true,
//   },
// ];

// export function RestaurantProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [tables, setTables] = useState<Table[]>(dummyTables);
//   const [currentZone, setCurrentZone] = useState<string>("Indoor");
//   const [menuItems, setMenuItems] = useState<MenuItem[]>(dummyMenuItems);
//   const [orders, setOrders] = useState<Order[]>(dummyOrders);
//   const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);
//   const [ingredients, setIngredients] =
//     useState<Ingredient[]>(dummyIngredients);
//   const [settings, setSettings] = useState<RestaurantSettings>(dummySettings);
//   const [stats, setStats] = useState<RestaurantStats>(dummyStats);
//   const [users] = useState<RestaurantUser[]>(dummyUsers);
//   const [roles] = useState<UserRole[]>(dummyRoles);
//   const [payments, setPayments] = useState<Payment[]>([]);

//   const zones = ["Indoor", "Outdoor", "VIP"];
//   const activeOrders = orders.filter(
//     (order) => order.status !== "Completed" && order.status !== "Cancelled"
//   );

//   const updateTableStatus = (tableId: string, status: Table["status"]) => {
//     setTables((prev) =>
//       prev.map((table) => (table.id === tableId ? { ...table, status } : table))
//     );
//   };

//   const addMenuItem = (item: Omit<MenuItem, "id">) => {
//     const newItem: MenuItem = {
//       ...item,
//       id: Date.now().toString(),
//     };
//     setMenuItems((prev) => [...prev, newItem]);
//   };

//   const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
//     setMenuItems((prev) =>
//       prev.map((menuItem) =>
//         menuItem.id === id ? { ...menuItem, ...item } : menuItem
//       )
//     );
//   };

//   const deleteMenuItem = (id: string) => {
//     setMenuItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const createOrder = (tableId: string, waiterId: string): string => {
//     const table = tables.find((t) => t.id === tableId);
//     const waiter = users.find((u) => u.id === waiterId);

//     if (!table || !waiter) return "";

//     const newOrder: Order = {
//       id: Date.now().toString(),
//       tableId,
//       table,
//       items: [],
//       status: "Open",
//       waiterId,
//       waiterName: waiter.name,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       subtotal: 0,
//       tax: 0,
//       serviceCharge: 0,
//       discount: 0,
//       total: 0,
//     };

//     setOrders((prev) => [...prev, newOrder]);
//     updateTableStatus(tableId, "Occupied");

//     return newOrder.id;
//   };

//   const addItemToOrder = (orderId: string, item: any) => {
//     setOrders((prev) =>
//       prev.map((order) => {
//         if (order.id === orderId) {
//           const newItems = [...order.items, item];
//           const subtotal = newItems.reduce((sum, item) => sum + item.price, 0);
//           const tax = subtotal * (settings.vatRate / 100);
//           const serviceCharge = subtotal * (settings.serviceChargeRate / 100);
//           const total = subtotal + tax + serviceCharge;

//           return {
//             ...order,
//             items: newItems,
//             subtotal,
//             tax,
//             serviceCharge,
//             total,
//             updatedAt: new Date().toISOString(),
//           };
//         }
//         return order;
//       })
//     );
//   };

//   const updateOrderStatus = (orderId: string, status: Order["status"]) => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === orderId
//           ? { ...order, status, updatedAt: new Date().toISOString() }
//           : order
//       )
//     );

//     if (status === "Completed") {
//       const order = orders.find((o) => o.id === orderId);
//       if (order) {
//         updateTableStatus(order.tableId, "Available");
//       }
//     }
//   };
//   const updateOrder = (orderId: string, updates: Partial<Order>) => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === orderId
//           ? {
//               ...order,
//               ...updates,
//               updatedAt: new Date().toISOString(),
//               // Recalculate totals if items were updated
//               ...(updates.items
//                 ? {
//                     subtotal: updates.items.reduce(
//                       (sum, item) => sum + item.price,
//                       0
//                     ),
//                     tax:
//                       updates.items.reduce((sum, item) => sum + item.price, 0) *
//                       (settings.vatRate / 100),
//                     serviceCharge:
//                       updates.items.reduce((sum, item) => sum + item.price, 0) *
//                       (settings.serviceChargeRate / 100),
//                     total:
//                       updates.items.reduce((sum, item) => sum + item.price, 0) *
//                       (1 +
//                         settings.vatRate / 100 +
//                         settings.serviceChargeRate / 100),
//                   }
//                 : {}),
//             }
//           : order
//       )
//     );
//   };
//   const updateTicketStatus = (
//     ticketId: string,
//     status: KitchenTicket["status"]
//   ) => {
//     setKitchenTickets((prev) =>
//       prev.map((ticket) =>
//         ticket.id === ticketId ? { ...ticket, status } : ticket
//       )
//     );
//   };

//   const updateIngredientStock = (id: string, stock: number) => {
//     setIngredients((prev) =>
//       prev.map((ingredient) =>
//         ingredient.id === id
//           ? { ...ingredient, currentStock: stock }
//           : ingredient
//       )
//     );
//   };

//   const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
//     setSettings((prev) => ({ ...prev, ...newSettings }));
//   };

//   const processPayment = (
//     orderId: string,
//     payment: Omit<Payment, "id" | "createdAt">
//   ) => {
//     const newPayment: Payment = {
//       ...payment,
//       id: Date.now().toString(),
//       createdAt: new Date().toISOString(),
//     };
//     setPayments((prev) => [...prev, newPayment]);
//     updateOrderStatus(orderId, "Completed");
//   };

//   const generateReport = (period: string): RestaurantReport => {
//     const completedOrders = orders.filter(
//       (order) => order.status === "Completed"
//     );
//     const totalSales = completedOrders.reduce(
//       (sum, order) => sum + order.total,
//       0
//     );
//     const totalOrders = completedOrders.length;
//     const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

//     return {
//       period,
//       totalSales,
//       totalOrders,
//       averageOrderValue,
//       topItems: [],
//       tableUtilization: [],
//     };
//   };

//   const value: RestaurantContextType = {
//     tables,
//     zones,
//     currentZone,
//     setCurrentZone,
//     updateTableStatus,
//     menuItems,
//     addMenuItem,
//     updateMenuItem,
//     deleteMenuItem,
//     orders,
//     activeOrders,
//     createOrder,
//     addItemToOrder,
//     updateOrderStatus,
//     updateOrder,
//     kitchenTickets,
//     updateTicketStatus,
//     ingredients,
//     updateIngredientStock,
//     settings,
//     updateSettings,
//     stats,
//     users,
//     roles,
//     payments,
//     processPayment,
//     generateReport,
//   };

//   return (
//     <RestaurantContext.Provider value={value}>
//       {children}
//     </RestaurantContext.Provider>
//   );
// }

// export const useRestaurant = () => {
//   const context = useContext(RestaurantContext);
//   if (context === undefined) {
//     throw new Error("useRestaurant must be used within a RestaurantProvider");
//   }
//   return context;
// };
