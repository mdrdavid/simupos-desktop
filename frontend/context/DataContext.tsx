/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useBranch } from "./BranchContext";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { PAGINATION_CONFIG } from "@/constants/pagination";

interface Transaction {
  id: string;
  transactionId?: string;
  amount: number;
  paymentMethod: "cash" | "mtn_momo" | "airtel_money";
  customerName?: string;
  customerPhone?: string;
  items: Item[];
  timestamp: string;
  isSynced: boolean;
  branchId: string;
  userId: string;
}
interface TransactionItem {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  productType: "retail" | "service" | "processed" | "raw_material" | "combo";
  unit?: string;
  purchasePrice?: number;
}
interface AgroTransactionInput {
  amount: number;
  paymentMethod: "cash" | "mtn_momo" | "airtel_money";
  customerName?: string;
  customerPhone?: string;
  items: {
    agroProductId: string;
    name: string;
    sellingPrice: number;
    quantity: number;
    unit?: string;
  }[];
}

export interface Item {
  id: string;
  name: string;
  sellingPrice: number;
  purchasePrice?: number;
  stockQuantity?: number;
  quantity?: number;
  minStockLevel?: number;
  category?: string;
  branchId: string;
  profitPerUnit?: number;
  profitMargin?: number;
  barcode?: string;
  isActive: boolean;
  isAgroProduct?: boolean;
  productType: "retail" | "service" | "processed" | "raw_material" | "combo";
  unit?: string;
  subUnit?: string;
  conversionFactor?: number;
  rawMaterials?: { itemId: string; quantityNeeded: number }[];
  agroProductId?: string;
  itemId?: string; // For agro products, this links to the main item
}

export interface StockMovement {
  id: string;
  createdAt: string;
  itemId: string;
  item?: {
    name: string;
    // other item properties
  };
  previousStock: number;
  newStock: number;
  quantity: number;
  quantityChange: number;
  reason: string;
  type:
    | "in"
    | "out"
    | "adjustment"
    | "initial"
    | "production_input"
    | "production_output";
  unitCost: string;
  userId: string;
  isDeleted: boolean;
  lastSyncAt: string | null;
  reference: string | null;
}

export interface ProfitAnalysis {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    totalSales: number;
    totalRevenue: number;
    averageSaleValue: number;
    salesGrowth?: number;
  };
  costs: {
    totalExpenses: number;
    totalCOGS: number;
    operatingExpenses: number;
    expenseGrowth?: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    profitGrowth?: number;
  };
  breakdown: {
    dailyProfit: Array<{
      date: string;
      revenue: number;
      expenses: number;
      grossProfit: number;
      netProfit: number;
    }>;
    categoryExpenses: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    topProfitableItems: Array<{
      item: Item;
      quantitySold: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }>;
  };
}

export interface QuickProfitSummary {
  period: string;
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  growth?: {
    sales?: number;
    expenses?: number;
    profit?: number;
  };
}

export interface BranchProfitComparison {
  branch: {
    id: string;
    name: string;
    isMain: boolean;
  };
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}
interface DataContextType {
  transactions: Transaction[];
  items: Item[];
  stockMovements: StockMovement[];
  loading: boolean;
  error: string | null;

  // Transaction methods
  // createTransaction: (
  //   transaction: Omit<
  //     Transaction,
  //     "id" | "timestamp" | "isSynced" | "branchId" | "userId"
  //   >
  // ) => Promise<Transaction>;
  createTransaction: (
    transaction: Omit<
      Transaction,
      "id" | "timestamp" | "isSynced" | "branchId" | "userId"
    > & {
      items: TransactionItem[];
    }
  ) => Promise<Transaction>;
  createAgroTransaction: (
    transaction: Omit<
      AgroTransactionInput,
      "id" | "timestamp" | "isSynced" | "branchId" | "userId"
    > & {
      items: Array<{
        agroProductId: string;
        name: string;
        sellingPrice: number;
        quantity: number;
        unit?: string;
      }>;
    }
  ) => Promise<AgroTransactionInput>;
  getTransactions: (filters?: {
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: string;
    customerPhone?: string;
    page?: number;
    limit?: number;
  }) => Promise<Transaction[]>;
  createCustomAmountTransaction: (
    amount: number,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    customerName?: string,
    customerPhone?: string,
    customItemName?: string
  ) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  // Item methods
  createItem: (
    item: Omit<
      Item,
      "id" | "branchId" | "profitPerUnit" | "profitMargin" | "isActive"
    >
  ) => Promise<Item>;
  updateItem: (id: string, item: Partial<Item>) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
  getItems: (filters?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<Item[]>;

  // Stock methods
  restockItem: (
    itemId: string,
    quantity: number,
    notes?: string
  ) => Promise<StockMovement>;
  findExistingItem: (name: string) => Item | undefined;
  getStockMovements: (filters?: {
    itemId?: string;
    startDate?: Date;
    endDate?: Date;
    movementType?: string;
    page?: number;
    limit?: number;
  }) => Promise<StockMovement[]>;
  getMonthlyStockMovements: (
    year: number,
    month: number
  ) => Promise<StockMovement[]>;

  // Reports and analytics
  getSalesReport: (
    period: "day" | "week" | "month" | "year" | "custom",
    customRange?: { start: Date; end: Date }
  ) => Promise<{
    totalSales: number;
    totalItemsSold: number;
    paymentMethodBreakdown: Record<string, number>;
  }>;

  getInventoryReport: () => Promise<{
    totalItems: number;
    totalStockValue: number;
    lowStockItems: Item[];
    outOfStockItems: Item[];
  }>;

  syncData: () => Promise<void>;
  // new methods for sales and inventory
  getTodaysSales: () => number;
  getWeeklySales: () => number;
  getMonthlySales: () => number;
  getQuarterlySales: () => number;
  getYearlySales: () => number;

  // Production methods
  produceItem: (
    processedItemId: string,
    quantityToProduce: number
  ) => Promise<{
    inputMovements: StockMovement[];
    outputMovement: StockMovement;
  }>;
  //  new methods
  getLowStockItems: () => Item[];
  getOutOfStockItems: () => Item[];
  getStockValue: () => { selling: number; purchase: number; profit: number };
  getItemsByBranch: () => Item[];
  getTotalProfit: () => number;

  // Profit methods
  getProfitAnalysis: (
    branchId: string,
    startDate: Date,
    endDate: Date,
    compareWithPrevious?: boolean
  ) => Promise<ProfitAnalysis>;
  getQuickProfitSummary: (
    branchId: string,
    period: "today" | "week" | "month" | "quarter" | "year"
  ) => Promise<QuickProfitSummary>;
  getAllBranchesProfitComparison: (
    startDate: Date,
    endDate: Date
  ) => Promise<{
    period: { startDate: string; endDate: string };
    branches: BranchProfitComparison[];
    totals: {
      revenue: number;
      expenses: number;
      grossProfit: number;
      netProfit: number;
    };
  }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const { currentBranch } = useBranch();
  const { user, getAuthHeaders } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load initial data when branch or user changes
  useEffect(() => {
    if (currentBranch && user) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch, user]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const headers = await getAuthHeaders();

      const [itemsData, transactionsData, movementsData] = await Promise.all([
        httpClient(
          `/items/branch/${currentBranch.id}?page=${PAGINATION_CONFIG.DEFAULT_PAGE}&limit=${PAGINATION_CONFIG.DEFAULT_ITEM_LIMIT}`,
          {
            headers,
          }
        ),
        httpClient(
          `/transactions/branch/${currentBranch.id}?page=${PAGINATION_CONFIG.DEFAULT_PAGE}&limit=${PAGINATION_CONFIG.DEFAULT_TRANSACTION_LIMIT}`,
          {
            headers,
          }
        ),
        httpClient(
          `/items/stock-movements/${currentBranch.id}?page=${PAGINATION_CONFIG.DEFAULT_PAGE}&limit=${PAGINATION_CONFIG.DEFAULT_MOVEMENT_LIMIT}`,
          { headers }
        ),
      ]);
      setItems(itemsData.items || []);
      setTransactions(transactionsData.transactions || []);
      setStockMovements(movementsData.movements || []);

      // Check for last sync time in AsyncStorage
      const lastSync = localStorage.getItem("lastSyncTime");
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch, user, getAuthHeaders]);

  const createAgroTransaction = async (
    transaction: Omit<
      AgroTransactionInput,
      "id" | "timestamp" | "isSynced" | "branchId" | "userId"
    > & {
      items: Array<{
        agroProductId: string;
        name: string;
        sellingPrice: number;
        quantity: number;
        unit?: string;
      }>;
    }
  ): Promise<AgroTransactionInput> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch || !user) {
        throw new Error("No branch selected or user not authenticated");
      }

      const headers = await getAuthHeaders();

      // Prepare the request payload specifically for agro transactions
      const payload = {
        ...transaction,
        customerName: transaction.customerName || null,
        customerPhone: transaction.customerPhone || null,
        items: transaction.items.map((item) => ({
          agroProductId: item.agroProductId,
          price: Number(item.sellingPrice),
          quantity: item.quantity || 1,
          name: item.name,
          unit: item.unit || "kg", // Default unit for agro products
        })),
        branchId: currentBranch.id,
      };

      const newTransaction = await httpClient("/transactions/agro", {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      // First, refetch the latest transactions
      const updatedTransactions = await getTransactions();

      // Then update the state with the fresh data
      setTransactions(updatedTransactions);

      return newTransaction;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create agro transaction"
      );
      console.error("Agro transaction creation error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyStockMovements = async (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return getStockMovements({ startDate, endDate });
  };

  const createTransaction = async (
    transaction: Omit<
      Transaction,
      "id" | "timestamp" | "isSynced" | "branchId" | "userId"
    >
  ): Promise<Transaction> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch || !user) {
        throw new Error("No branch selected or user not authenticated");
      }

      const headers = await getAuthHeaders();
      const response = await httpClient("/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...transaction,
          customerName: transaction.customerName || "",
          customerPhone: transaction.customerPhone || "",
          items: transaction.items.map((item) => ({
            itemId: item.id,
            price: Number(item.sellingPrice),
            quantity: item.quantity || 1,
            purchasePrice: item.purchasePrice
              ? Number(item.purchasePrice)
              : null,
            name: item.name,
            productType: item.productType,
            unit: item.unit,
            subUnit: item.subUnit,
            conversionFactor: item.conversionFactor
              ? Number(item.conversionFactor)
              : undefined,
          })),
          branchId: currentBranch.id,
          // userId: user.id,
        }),
        headers,
      });

      // Update local state with the new transaction
      // setTransactions((prev) => [response, ...prev]);
      // First, refetch the latest transactions
      const updatedTransactions = await getTransactions();

      // Then update the state with the fresh data
      setTransactions(updatedTransactions);

      // Refetch items to get updated stock quantities
      const updatedItems = await getItems();
      setItems(updatedItems);

      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction"
      );
      console.error("Transaction creation error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // const createTransaction = async (
  //   transaction: Omit<
  //     Transaction,
  //     "id" | "timestamp" | "isSynced" | "branchId" | "userId"
  //   >
  // ): Promise<Transaction> => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     if (!currentBranch || !user) {
  //       throw new Error("No branch selected or user not authenticated");
  //     }
  //     const headers = await getAuthHeaders();
  //     const newTransaction = await httpClient("/transactions", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         ...transaction,
  //         customerName: transaction.customerName || "",
  //         customerPhone: transaction.customerPhone || "",
  //         items: transaction.items.map((item) => ({
  //           itemId: item.id,
  //           price: Number(item.sellingPrice),
  //           quantity: item.quantity || 1,
  //           purchasePrice: item.purchasePrice
  //             ? Number(item.purchasePrice)
  //             : null,
  //           name: item.name,
  //           productType: item.productType,
  //           unit: item.unit,
  //           subUnit: item.subUnit,
  //           conversionFactor: item.conversionFactor
  //             ? Number(item.conversionFactor)
  //             : undefined,
  //         })),
  //         branchId: currentBranch.id,
  //       }),
  //       headers,
  //     });

  // // First, refetch the latest transactions
  // const updatedTransactions = await getTransactions();

  // // Then update the state with the fresh data
  // setTransactions(updatedTransactions);

  // return newTransaction;
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "Failed to create transaction"
  //     );
  //     console.error("Transaction creation error:", err);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const createCustomAmountTransaction = async (
    amount: number,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    customerName?: string,
    customerPhone?: string,
    customItemName?: string
  ): Promise<Transaction> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch || !user) {
        throw new Error("No branch selected or user not authenticated");
      }

      const headers = await getAuthHeaders();
      const newTransaction = await httpClient("/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount,
          paymentMethod,
          customerName: customerName || "",
          customerPhone: customerPhone || "",
          branchId: currentBranch.id,
          customItemName: customItemName || "",
          isCustomAmount: true,
          items: [],
        }),
        headers,
      });

      // Refetch transactions
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);

      return newTransaction;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create custom amount transaction"
      );
      console.error("Custom amount transaction error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const query = new URLSearchParams();

      // Add filters but don't duplicate branchId
      Object.entries(filters).forEach(([key, value]) => {
        if (value instanceof Date) {
          query.append(key, value.toISOString());
        } else if (value !== undefined) {
          query.append(key, String(value));
        }
      });

      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/transactions/branch/${currentBranch.id}?${query.toString()}`,
        { headers }
      );

      return response.transactions;
    } catch (err: any) {
      if (
        err.message.includes("unauthorized") ||
        err.message.includes("No authentication")
      ) {
        // Let the auth logic handle redirection
        return [];
      }

      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
      console.error("Transactions fetch error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // const getTransactions = async (filters = {}) => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const query = new URLSearchParams();
  //     if (currentBranch) query.append("branchId", currentBranch.id);

  //     Object.entries(filters).forEach(([key, value]) => {
  //       if (value instanceof Date) {
  //         query.append(key, value.toISOString());
  //       } else if (value !== undefined) {
  //         query.append(key, String(value));
  //       }
  //     });

  //     if (!currentBranch) {
  //       throw new Error("No branch selected");
  //     }
  //     console.log("currentBranch",currentBranch)
  //     const response = await httpClient(
  //       `/transactions/branch/${currentBranch.id}?${query.toString()}`
  //     );
  //     return response.transactions;
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "Failed to fetch transactions"
  //     );
  //     console.error("Transactions fetch error:", err);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Delete transaction

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await httpClient(`/transactions/${id}`, {
        method: "DELETE",
        headers,
      });

      // Get the transaction being deleted
      const deletedTransaction = transactions.find((t) => t.id === id);

      // Remove the transaction from local state
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Update local items state if needed (optional)
      if (deletedTransaction?.items) {
        setItems((prevItems) => {
          return prevItems.map((item) => {
            const transactionItem = deletedTransaction.items.find(
              (ti) => ti.itemId === item.id
            );
            if (
              transactionItem &&
              typeof transactionItem.quantity === "number"
            ) {
              return {
                ...item,
                stockQuantity:
                  (item.stockQuantity || 0) + transactionItem.quantity,
              };
            }
            return item;
          });
        });
      }

      toast({
        title: "Success",
        description: "Transaction deleted and stock restored",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete transaction";

      setError(errorMessage);
      console.error("Transaction deletion error:", err);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };
  //items
  const createItem = async (
    item: Omit<
      Item,
      "id" | "branchId" | "profitPerUnit" | "profitMargin" | "isActive"
    >
  ): Promise<Item> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const headers = await getAuthHeaders();

      // Prepare the request body according to backend expectations
      const requestBody = {
        name: item.name,
        sellingPrice: item.sellingPrice,
        purchasePrice: item.purchasePrice,
        stockQuantity: item.stockQuantity ?? 0, // Default to 0 if undefined
        minStockLevel: item.minStockLevel ?? 0, // Default to 0 if undefined
        category: item.category,
        branchId: currentBranch.id,
        barcode: item.barcode,
        // isActive: item.isActive !== false, // Default to true
        productType: item.productType ?? "retail", // Default to retail
        unit: item.unit,
        subUnit: item.subUnit,
        conversionFactor: item.conversionFactor,
        rawMaterials: item.rawMaterials,
      };

      const newItem = await httpClient("/items", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
      });

      // Transform backend response to frontend format
      const transformedItem = {
        id: newItem.id,
        name: newItem.name,
        sellingPrice: newItem.sellingPrice,
        purchasePrice: newItem.purchasePrice,
        stockQuantity: newItem.stockQuantity,
        minStockLevel: newItem.minStockLevel,
        category: newItem.category,
        branchId: newItem.branchId,
        barcode: newItem.barcode,
        isActive: newItem.isActive,
        productType: newItem.productType,
        unit: newItem.unit,
        subUnit: newItem.subUnit,
        conversionFactor: newItem.conversionFactor,
        rawMaterials: newItem.rawMaterials,
        profitPerUnit: newItem.profitPerUnit ?? 0, // Backend will calculate
        profitMargin: newItem.profitMargin ?? 0, // Backend will calculate
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
      };

      setItems((prev) => [transformedItem, ...prev]);
      return transformedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
      console.error("Item creation error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, item: Partial<Item>): Promise<Item> => {
    try {
      setLoading(true);
      setError(null);

      const updatedItem = await httpClient(`/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(item),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      console.error("Item update error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await httpClient(`/items/${id}`, {
        method: "DELETE",
      });

      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
      console.error("Item deletion error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getItems = async (
    filters: {
      search?: string;
      category?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const query = new URLSearchParams();

      // Add filters to query parameters
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.lowStock) query.append("lowStock", String(filters.lowStock));
      if (filters.outOfStock)
        query.append("outOfStock", String(filters.outOfStock));
      if (filters.page) query.append("page", filters.page.toString());
      if (filters.limit) query.append("limit", filters.limit.toString());

      const url = `/items/branch/${currentBranch.id}?${query.toString()}`;
      console.log("Fetching items from:", url);

      // Get auth headers with token
      const headers = await getAuthHeaders();

      // Pass headers to httpClient
      const response = await httpClient(url, { headers });
      return response.items;
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch items");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findExistingItem = (name: string): Item | undefined => {
    return items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase().trim()
    );
  };

  // Stock methods
  const restockItem = async (
    itemId: string,
    quantity: number,
    notes?: string
  ): Promise<StockMovement> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("User not authenticated");
      }

      const movement = await httpClient(`/items/${itemId}/top-up`, {
        method: "POST",
        body: JSON.stringify({
          quantity,
          notes,
          userId: user.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update local state
      setStockMovements((prev) => [movement, ...prev]);

      // Update item stock quantity
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, stockQuantity: (item.stockQuantity || 0) + quantity }
            : item
        )
      );

      return movement;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restock item");
      console.error("Restock error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const getStockMovements = async (
    filters: {
      movementType?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const query = new URLSearchParams();

      // Map frontend filter names to backend expected names
      if (filters.movementType) query.append("type", filters.movementType);
      if (filters.startDate)
        query.append("startDate", filters.startDate.toISOString());
      if (filters.endDate)
        query.append("endDate", filters.endDate.toISOString());
      if (filters.page) query.append("page", filters.page.toString());
      if (filters.limit) query.append("limit", filters.limit.toString());

      const response = await httpClient(
        `/items/stock-movements/${currentBranch.id}?${query.toString()}`
      );
      // Return the movements array from the paginated response
      return response.movements;
    } catch (err) {
      console.error("Detailed error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock movements"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalesReport = async (
    period: "day" | "week" | "month" | "year" | "custom",
    customRange?: { start: Date; end: Date }
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const response = await httpClient("/reports/sales", {
        method: "POST",
        body: JSON.stringify({
          branchId: currentBranch.id,
          period,
          customRange,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate sales report"
      );
      console.error("Sales report error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInventoryReport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentBranch) {
        throw new Error("No branch selected");
      }

      const response = await httpClient(
        `/reports/inventory?branchId=${currentBranch.id}`
      );
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate inventory report"
      );
      console.error("Inventory report error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sync method
  const syncData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await httpClient("/sync", {
        method: "POST",
        body: JSON.stringify({
          branchId: currentBranch?.id,
          lastSync: new Date().toISOString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update local state with synced data
      if (response.items) setItems(response.items);
      if (response.transactions) setTransactions(response.transactions);
      if (response.movements) setStockMovements(response.movements);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync data");
      console.error("Sync error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sales Analysis helper functions

  const getTodaysSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => {
        try {
          return t.timestamp && new Date(t.timestamp) >= today;
        } catch {
          return false; // Skip invalid dates
        }
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };
  const getWeeklySales = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= weekAgo;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const getMonthlySales = () => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1); // More accurate than 30 days

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= monthAgo;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const getQuarterlySales = () => {
    const quarterAgo = new Date();
    quarterAgo.setMonth(quarterAgo.getMonth() - 3); // More accurate than 90 days

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= quarterAgo;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const getYearlySales = () => {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1); // More accurate than 365 days

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= yearAgo;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // later use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSalesForPeriod = (
    period: "day" | "week" | "month" | "quarter" | "year"
  ) => {
    const now = new Date();
    const periodStart = new Date(now);

    switch (period) {
      case "day":
        periodStart.setHours(0, 0, 0, 0);
        break;
      case "week":
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case "month":
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case "quarter":
        periodStart.setMonth(periodStart.getMonth() - 3);
        break;
      case "year":
        periodStart.setFullYear(periodStart.getFullYear() - 1);
        break;
    }

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= periodStart;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Usage:
  // const todaysSales = getSalesForPeriod('day');
  // const weeklySales = getSalesForPeriod('week');

  // Production method implementation
  const produceItem = async (
    processedItemId: string,
    quantityToProduce: number
  ): Promise<{
    inputMovements: StockMovement[];
    outputMovement: StockMovement;
  }> => {
    if (!currentBranch || !user) {
      throw new Error("Branch or user context is missing for production.");
    }

    const processedItem = items.find((item) => item.id === processedItemId);
    if (!processedItem) {
      throw new Error(`Processed item with ID ${processedItemId} not found.`);
    }
    if (processedItem.productType !== "processed") {
      throw new Error(`Item ${processedItem.name} is not a processable item.`);
    }
    if (
      !processedItem.rawMaterials ||
      processedItem.rawMaterials.length === 0
    ) {
      throw new Error(
        `Item ${processedItem.name} has no raw materials defined in its recipe.`
      );
    }
    if (quantityToProduce <= 0) {
      throw new Error("Quantity to produce must be greater than zero.");
    }

    const inputMovements: StockMovement[] = [];
    const updatedItemsBatch: Item[] = []; // To store changes to items locally

    // Check and prepare input movements
    for (const recipeMaterial of processedItem.rawMaterials) {
      const rawMaterialItem = items.find(
        (item) => item.id === recipeMaterial.itemId
      );
      if (!rawMaterialItem) {
        throw new Error(
          `Raw material item with ID ${recipeMaterial.itemId} not found in inventory.`
        );
      }

      const totalQuantityNeeded =
        recipeMaterial.quantityNeeded * quantityToProduce;

      if ((rawMaterialItem.stockQuantity || 0) < totalQuantityNeeded) {
        throw new Error(
          `Insufficient stock for raw material: ${rawMaterialItem.name}. Needed: ${totalQuantityNeeded}, Available: ${rawMaterialItem.stockQuantity || 0}`
        );
      }

      const inputMovement: StockMovement = {
        id: `sm_${new Date().toISOString()}_input_${rawMaterialItem.id}`, // Temporary ID
        itemId: rawMaterialItem.id,
        item: {
          name: rawMaterialItem.name,
        },
        type: "production_input",
        quantity: totalQuantityNeeded,
        quantityChange: -totalQuantityNeeded,
        previousStock: rawMaterialItem.stockQuantity || 0,
        newStock: (rawMaterialItem.stockQuantity || 0) - totalQuantityNeeded,
        reason: `Consumed for production of ${quantityToProduce} x ${processedItem.name}`,
        unitCost: "",
        userId: user.id,
        isDeleted: false,
        lastSyncAt: null,
        reference: null,
        createdAt: new Date().toISOString(),
      };
      inputMovements.push(inputMovement);

      // Prepare updated raw material item for local state update
      updatedItemsBatch.push({
        ...rawMaterialItem,
        stockQuantity:
          (rawMaterialItem.stockQuantity || 0) - totalQuantityNeeded,
      });
    }

    // Prepare output movement
    const outputMovement: StockMovement = {
      id: `sm_${new Date().toISOString()}_output_${processedItem.id}`, // Temporary ID
      itemId: processedItem.id,
      item: {
        name: processedItem.name,
      },
      type: "production_output",
      quantity: quantityToProduce,
      quantityChange: quantityToProduce,
      previousStock: processedItem.stockQuantity || 0,
      newStock: (processedItem.stockQuantity || 0) + quantityToProduce,
      reason: `Produced ${quantityToProduce} units`,
      unitCost: "",
      userId: user.id,
      isDeleted: false,
      lastSyncAt: null,
      reference: null,
      createdAt: new Date().toISOString(),
    };

    // Prepare updated processed item for local state update
    updatedItemsBatch.push({
      ...processedItem,
      stockQuantity: (processedItem.stockQuantity || 0) + quantityToProduce,
    });

    // TODO: Implement actual backend calls here to persist movements and update stock
    // For now, we'll update local state optimistically

    setItems((prevItems) => {
      return prevItems.map((item) => {
        const updatedVersion = updatedItemsBatch.find(
          (ui) => ui.id === item.id
        );
        return updatedVersion ? updatedVersion : item;
      });
    });

    setStockMovements((prevMovements) => [
      ...prevMovements,
      ...inputMovements,
      outputMovement,
    ]);

    console.log("Production successful: ", { inputMovements, outputMovement });
    return { inputMovements, outputMovement };
  };
  // Helper methods for inventory analysis
  const getLowStockItems = (): Item[] => {
    return items.filter((item) => {
      if (item.stockQuantity === undefined || item.minStockLevel === undefined)
        return false;
      return item.stockQuantity > 0 && item.stockQuantity <= item.minStockLevel;
    });
  };

  const getOutOfStockItems = (): Item[] => {
    return items.filter((item) => {
      if (item.stockQuantity === undefined) return false;
      return item.stockQuantity <= 0;
    });
  };

  const getStockValue = () => {
    const sellingValue = items.reduce((sum, item) => {
      return sum + item.sellingPrice * (item.stockQuantity || 0);
    }, 0);

    const purchaseValue = items.reduce((sum, item) => {
      return sum + (item.purchasePrice || 0) * (item.stockQuantity || 0);
    }, 0);

    return {
      selling: sellingValue,
      purchase: purchaseValue,
      profit: sellingValue - purchaseValue,
    };
  };

  const getItemsByBranch = (): Item[] => {
    if (!currentBranch) return [];
    const branchItems = items.filter(
      (item) => item.branchId === currentBranch.id
    );
    return branchItems;
  };

  const getTotalProfit = (): number => {
    return items.reduce((sum, item) => {
      const profit = (item.profitPerUnit || 0) * (item.stockQuantity || 0);
      return sum + profit;
    }, 0);
  };

  // profit methods
  const getProfitAnalysis = async (
    branchId: string,
    startDate: Date,
    endDate: Date,
    compareWithPrevious = false
  ): Promise<ProfitAnalysis> => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/profit/branch/${branchId}/analysis?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&compare=${compareWithPrevious}`,
        { headers }
      );

      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get profit analysis"
      );
      console.error("Profit analysis error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getQuickProfitSummary = async (
    branchId: string,
    period: "today" | "week" | "month" | "quarter" | "year"
  ): Promise<QuickProfitSummary> => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/profit/branch/${branchId}/summary?period=${period}`,
        { headers }
      );

      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get quick profit summary"
      );
      console.error("Quick profit summary error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllBranchesProfitComparison = async (
    startDate: Date,
    endDate: Date
  ) => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/profit/comparison?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { headers }
      );

      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get branches profit comparison"
      );
      console.error("Branches profit comparison error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: DataContextType = {
    transactions,
    items,
    stockMovements,
    loading,
    error,
    produceItem, // Add new function to context value

    // Transaction methods
    createTransaction,
    createAgroTransaction,
    createCustomAmountTransaction,
    getTransactions,
    deleteTransaction,
    // Item methods
    createItem,
    updateItem,
    deleteItem,
    getItems,
    findExistingItem,
    // Stock methods
    restockItem,
    getStockMovements,
    getMonthlyStockMovements,

    // Reports
    getSalesReport,
    getInventoryReport,

    // Sync
    syncData,
    //new methods for sales and inventory
    getTodaysSales,
    getWeeklySales,
    getMonthlySales,
    getQuarterlySales,
    getYearlySales,

    // Add these new methods:
    getLowStockItems,
    getOutOfStockItems,
    getStockValue,
    getItemsByBranch,
    getTotalProfit,

    // Profit methods
    getProfitAnalysis,
    getQuickProfitSummary,
    getAllBranchesProfitComparison,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
