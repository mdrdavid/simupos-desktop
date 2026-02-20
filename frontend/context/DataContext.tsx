/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import * as itemHttpClient from "@/src/data/api/item-http-client";
import { useBranch } from "./BranchContext";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { PAGINATION_CONFIG } from "@/constants/pagination";
import { createStoreApi } from "@/src/data/api/store-http-client";

export interface Transaction {
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
  //  CREDIT SALE FIELDS
  isCreditSale?: boolean;
  amountPaid?: number;
  balanceDue?: number;
  creditEntryId?: string;
  isCustomAmount?: boolean;
  customItemName?: string;
  userName?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}
interface TransactionItem {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  productType: "retail" | "service" | "processed" | "raw_material" | "combo";
  unit?: string;
  subUnit?: string;
  conversionFactor?: number;
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
  isCreditSale?: boolean;
  amountPaid?: number;
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
    id: string;
    name: string;
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

// store
export interface Store {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  isWarehouse: boolean;
  branchId: string;
  managerId?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreItem {
  id: string;
  storeId: string;
  itemId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  item?: {
    id: string;
    name: string;
    sellingPrice: number;
    purchasePrice?: number;
    barcode?: string;
    category?: string;
    productType: string;
    unit?: string;
  };
  store?: {
    id: string;
    name: string;
  };
}
export interface StockTransferRequest {
  fromStoreId: string;
  toStoreId: string;
  itemId: string;
  quantity: number;
  reason?: string;
}
export interface DetailedInventoryReportItem {
  itemId: string;
  itemName: string;
  barcode: string;
  openingStock: number;
  stockAdded: number;
  stockRemoved: number;
  closingStock: number;
  movements: number;
}

export interface DailyInventoryReport {
  date: string;
  items: DetailedInventoryReportItem[];
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
  stockSummary: {
    totalItems: number;
    totalItemsInStock: number;
    totalStockValue: number;
  };
  loading: boolean;
  error: string | null;
  hasMoreItems: boolean;
  isFetchingMoreItems: boolean;
  loadMoreItems: () => void;
  totalItems: number;
  hasMoreTransactions: boolean;
  isFetchingMoreTransactions: boolean;
  loadMoreTransactions: () => void;
  totalTransactions: number;
  totalPages: number;
  currentPage: number;

  // Transaction methods
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
  getTransactions: (
    filters?: {
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
      customerPhone?: string;
      page?: number;
      limit?: number;
      period?: string;
      search?: string;
    },
    loadMore?: boolean
  ) => Promise<Transaction[]>;
  createCustomAmountTransaction: (
    amount: number,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    customerName?: string,
    customerPhone?: string,
    customItemName?: string,
    isCreditSale?: boolean,
    amountPaid?: number
  ) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  // Item methods
  createItem: (
    item: Omit<
      Item,
      "id" | "branchId" | "profitPerUnit" | "profitMargin" | "isActive"
    > & { supplierId?: string }
  ) => Promise<Item>;
  updateItem: (id: string, item: Partial<Item>) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
  getItems: (
    filters?: {
      search?: string;
      category?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      page?: number;
      limit?: number;
    },
    loadMore?: boolean
  ) => Promise<Item[]>;
  getItem: (id: string) => Promise<Item>;
  getItemByBarcode: (barcode: string) => Promise<Item | null>;
  bulkUploadItems: (file: File) => Promise<any>;

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

  getInventorySummary: () => Promise<{
    totalItems: number;
    activeProducts: number;
    lowStock: number;
    outOfStock: number;
    categories: { category: string; count: number }[];
    totalStockValue: number;
  }>;
  getInventoryReport: (
    startDate: Date,
    endDate: Date,
    productId?: string
  ) => Promise<DailyInventoryReport[]>;

  syncData: () => Promise<void>;
  // new methods for sales and inventory
  getTodaysSales: () => number;
  getWeeklySales: () => number;
  getMonthlySales: () => number;
  getLast30DaysSales: () => number;
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
  getAllBranchItems: () => Promise<Item[]>;

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

  // Store Management
  stores: Store[];
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;

  // Store Methods
  getStoresByBranch: (
    branchId: string,
    filters?: {
      isActive?: boolean;
      isWarehouse?: boolean;
    }
  ) => Promise<Store[]>;
  createStore: (storeData: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    branchId: string;
    managerId?: string;
    isWarehouse?: boolean;
  }) => Promise<Store>;
  updateStore: (id: string, storeData: Partial<Store>) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;

  // Store Items
  getStoreItems: (
    storeId: string,
    filters?: {
      lowStock?: boolean;
      outOfStock?: boolean;
    }
  ) => Promise<StoreItem[]>;
  addItemToStore: (
    storeId: string,
    itemId: string,
    quantity?: number,
    minStockLevel?: number,
    maxStockLevel?: number
  ) => Promise<StoreItem>;
  updateStoreItemQuantity: (
    storeId: string,
    itemId: string,
    quantity: number
  ) => Promise<StoreItem>;

  // Stock Operations
  transferStock: (transferData: StockTransferRequest) => Promise<{
    fromStoreItem: StoreItem;
    toStoreItem: StoreItem;
  }>;

  // Reports
  getStoreStockSummary: (storeId: string) => Promise<{
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
  getItemStockAcrossStores: (
    itemId: string,
    branchId: string
  ) => Promise<{
    totalStock: number;
    storeStocks: Array<{
      storeId: string;
      storeName: string;
      quantity: number;
    }>;
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
  const [searchQuery, setSearchQuery] = useState("");
  const { currentBranch } = useBranch();
  const { user, getAuthHeaders, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockSummary, setStockSummary] = useState({
    totalItems: 0,
    totalItemsInStock: 0,
    totalStockValue: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isFetchingMoreItems, setIsFetchingMoreItems] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isFetchingMoreTransactions, setIsFetchingMoreTransactions] =
    useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemCurrentPageRef = useRef(1);
  const transactionCurrentPageRef = useRef(1);

  const getItems = useCallback(
    async (
      filters: {
        search?: string;
        category?: string;
        lowStock?: boolean;
        outOfStock?: boolean;
        page?: number;
        limit?: number;
      } = {},
      loadMore = false
    ) => {
      if (isFetchingMoreItems) return [];

      try {
        if (loadMore) {
          setIsFetchingMoreItems(true);
        } else {
          setLoading(true);
          itemCurrentPageRef.current = 1;
          setHasMoreItems(true);
        }
        setError(null);

        if (!currentBranch) {
          throw new Error("No branch selected");
        }

        const pageToFetch =
          filters.page || (loadMore ? itemCurrentPageRef.current : 1);
        const limit = filters.limit || PAGINATION_CONFIG.DEFAULT_ITEM_LIMIT;

        const result = await itemHttpClient.getItems(
          currentBranch.id,
          { ...filters, page: pageToFetch, limit },
          getAuthHeaders
        );

        const fetchedItems = result.items || [];
        const summary = result.stockSummary || {
          totalItems: 0,
          totalItemsInStock: 0,
          totalStockValue: 0,
        };

        if (loadMore) {
          setItems((prevItems) => [...prevItems, ...fetchedItems]);
        } else {
          setItems(fetchedItems);
          setStockSummary(summary);
          setTotalItems(result.totalItems || 0);
        }

        if (fetchedItems.length < limit) {
          setHasMoreItems(false);
        } else {
          setHasMoreItems(true);
          itemCurrentPageRef.current = pageToFetch + 1;
        }

        return fetchedItems;
      } catch (err) {
        console.error("Detailed error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch items");
        throw err;
      } finally {
        if (loadMore) {
          setIsFetchingMoreItems(false);
        } else {
          setLoading(false);
        }
      }
    },
    [currentBranch, getAuthHeaders]
  );

  const loadMoreItems = () => {
    if (!isFetchingMoreItems && hasMoreItems) {
      getItems({ search: searchQuery }, true);
    }
  };

  const getTransactions = useCallback(
    async (
      filters: {
        startDate?: Date;
        endDate?: Date;
        paymentMethod?: string;
        customerPhone?: string;
        page?: number;
        limit?: number;
        period?: string;
        search?: string;
      } = {},
      loadMore = false
    ) => {
      if (isFetchingMoreTransactions && loadMore) return [];

      try {
        if (loadMore) {
          setIsFetchingMoreTransactions(true);
        } else {
          setLoading(true);
        }
        setError(null);

        if (!currentBranch) {
          throw new Error("No branch selected");
        }

        const limit =
          filters.limit || PAGINATION_CONFIG.DEFAULT_TRANSACTION_LIMIT;

        const baseQuery = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (key !== "page" && key !== "limit" && value !== undefined) {
            if (value instanceof Date) {
              baseQuery.append(key, value.toISOString());
            } else {
              baseQuery.append(key, String(value));
            }
          }
        });
        if (filters.period && filters.period !== "all") {
          baseQuery.append("period", filters.period);
        }

        const headers = await getAuthHeaders();

        if (loadMore) {
          const pageToFetch = transactionCurrentPageRef.current;
          const query = new URLSearchParams(baseQuery);
          query.append("page", pageToFetch.toString());
          query.append("limit", limit.toString());
          const response = await httpClient(
            `/transactions/branch/${currentBranch.id}?${query.toString()}`,
            { headers }
          );

          const newTransactions = response.transactions || [];
          const pagination = response.pagination || {};

          setTransactions((prev) => [...prev, ...newTransactions]);
          setTotalTransactions(pagination.total || 0);
          setTotalPages(pagination.pages || 1);
          setCurrentPage(pagination.page || pageToFetch);
          setHasMoreTransactions(
            (pagination.page || pageToFetch) < (pagination.pages || 1)
          );
          transactionCurrentPageRef.current =
            (pagination.page || pageToFetch) + 1;
          return newTransactions;
        }

        // Initial load: fetch first page of transactions
        const pageToFetch = filters.page || 1;
        const query = new URLSearchParams(baseQuery);
        query.append("page", pageToFetch.toString());
        query.append("limit", limit.toString());

        const response = await httpClient(
          `/transactions/branch/${currentBranch.id}?${query.toString()}`,
          { headers }
        );

        const transactions = response.transactions || [];
        const pagination = response.pagination || {};

        setTransactions(transactions);
        setTotalTransactions(pagination.total || 0);
        setTotalPages(pagination.pages || 1);
        setCurrentPage(pagination.page || 1);
        setHasMoreTransactions(
          (pagination.page || 1) < (pagination.pages || 1)
        );
        transactionCurrentPageRef.current = (pagination.page || 1) + 1;

        return transactions;
      } catch (err: any) {
        if (
          err.message.includes("unauthorized") ||
          err.message.includes("No authentication")
        ) {
          return [];
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions"
        );
        console.error("Transactions fetch error:", err);
        throw err;
      } finally {
        if (loadMore) {
          setIsFetchingMoreTransactions(false);
        } else {
          setLoading(false);
        }
      }
    },
    [currentBranch, getAuthHeaders]
  );

  const loadMoreTransactions = () => {
    if (!isFetchingMoreTransactions && hasMoreTransactions) {
      getTransactions({}, true);
    }
  };

  const getStockMovements = useCallback(
    async (
      filters: {
        itemId?: string;
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

        if (filters.itemId) query.append("itemId", filters.itemId);
        if (filters.movementType) query.append("type", filters.movementType);
        if (filters.startDate)
          query.append("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          query.append("endDate", filters.endDate.toISOString());
        if (filters.page) query.append("page", filters.page.toString());
        if (filters.limit) query.append("limit", filters.limit.toString());

        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/items/stock-movements/${currentBranch.id}?${query.toString()}`,
          { headers }
        );
        setStockMovements(response.movements);
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
    },
    [currentBranch, getAuthHeaders]
  );

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated || !currentBranch || !user) return;

    setError(null);
    setLoading(true);

    itemCurrentPageRef.current = 1;
    transactionCurrentPageRef.current = 1;
    setItems([]);
    setTransactions([]);

    try {
      await Promise.all([
        getItems({}),
        getTransactions({}),
        getStockMovements({}),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load initial data"
      );
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    currentBranch,
    user,
    getItems,
    getTransactions,
    getStockMovements,
  ]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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

      const payload = {
        ...transaction,
        customerName: transaction.customerName || null,
        customerPhone: transaction.customerPhone || null,
        isCreditSale: transaction.isCreditSale || false,
        amountPaid: transaction.amountPaid,
        items: transaction.items.map((item) => ({
          agroProductId: item.agroProductId,
          price: Number(item.sellingPrice),
          quantity: item.quantity || 1,
          name: item.name,
          unit: item.unit || "kg",
        })),
        branchId: currentBranch.id,
      };

      const response = await httpClient("/transactions/agro", {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      const newTransaction = response.data || response;

      setTransactions((prev) => [newTransaction, ...prev]);
      await getItems();
      getTransactions({ page: currentPage });

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
    > & {
      items: TransactionItem[];
    }
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
          isCreditSale: transaction.isCreditSale || false,
          amountPaid: transaction.amountPaid,
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
        }),
        headers,
      });

      const transactionData = response.data || response;

      setTransactions((prev) => [transactionData, ...prev]);
      await getItems();
      getTransactions({ page: currentPage });

      return transactionData;
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

  const createCustomAmountTransaction = async (
    amount: number,
    paymentMethod: "cash" | "mtn_momo" | "airtel_money",
    customerName?: string,
    customerPhone?: string,
    customItemName?: string,
    isCreditSale?: boolean,
    amountPaid?: number
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
          amount,
          paymentMethod,
          customerName: customerName || "",
          customerPhone: customerPhone || "",
          branchId: currentBranch.id,
          customItemName: customItemName || "",
          isCustomAmount: true,
          isCreditSale,
          amountPaid,
          items: [],
        }),
        headers,
      });

      const newTransaction = response.data || response;

      await getTransactions({ page: currentPage });
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

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      await httpClient(`/transactions/${id}`, {
        method: "DELETE",
        headers,
      });

      const deletedTransaction = transactions.find((t) => t.id === id);

      setTransactions((prev) => prev.filter((t) => t.id !== id));

      if (deletedTransaction?.items) {
        await getItems();
      }
      getTransactions({ page: currentPage });

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

  const createItem = useCallback(
    async (
      item: Omit<
        Item,
        "id" | "branchId" | "profitPerUnit" | "profitMargin" | "isActive"
      > & { supplierId?: string }
    ): Promise<Item> => {
      try {
        setLoading(true);
        setError(null);

        if (!currentBranch) {
          throw new Error("No branch selected");
        }

        const { supplierId, ...itemData } = item;
        const newItem = await itemHttpClient.createItem(
          { ...itemData, supplierId },
          currentBranch.id,
          getAuthHeaders
        );

        setItems((prev) => [newItem, ...prev]);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create item");
        console.error("Item creation error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranch, getAuthHeaders]
  );

  const getItem = useCallback(
    async (id: string): Promise<Item> => {
      try {
        setLoading(true);
        setError(null);

        const item = await itemHttpClient.getItem(id, getAuthHeaders);
        return item;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch item");
        console.error("Item fetch error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updateItem = useCallback(
    async (id: string, item: Partial<Item>): Promise<Item> => {
      try {
        setLoading(true);
        setError(null);
        const headers = await getAuthHeaders();
        const updatedItem = await httpClient(`/items/${id}`, {
          method: "PUT",
          body: JSON.stringify(item),
          headers,
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
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      // Get authentication headers
      const headers = await getAuthHeaders();
      await httpClient(`/items/${id}`, {
        method: "DELETE",
        headers,
      });

      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
      console.error("Item deletion error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUploadItems = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        setError(null);
        if (!currentBranch) {
          throw new Error("No branch selected");
        }
        const result = await itemHttpClient.bulkUploadItems(
          file,
          currentBranch.id,
          getAuthHeaders
        );
        // Refresh items list
        await getItems();
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload items in bulk"
        );
        console.error("Bulk upload error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranch, getAuthHeaders, getItems]
  );

  const findExistingItem = (name: string): Item | undefined => {
    return items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase().trim()
    );
  };

  const restockItem = useCallback(
    async (
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
        const headers = await getAuthHeaders();
        const movement = await httpClient(`/items/${itemId}/top-up`, {
          method: "POST",
          body: JSON.stringify({
            quantity,
            notes,
            userId: user.id,
          }),
          headers: headers,
        });

        setStockMovements((prev) => [movement, ...prev]);
        await getItems();

        return movement;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to restock item");
        console.error("Restock error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, getItems]
  );

  const getSalesReport = useCallback(
    async (
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
    },
    [currentBranch]
  );

  const getAllBranchItems = useCallback(async (): Promise<Item[]> => {
    if (!currentBranch) {
      throw new Error("No branch selected");
    }
    try {
      setLoading(true);
      const result = await itemHttpClient.getItems(
        currentBranch.id,
        { limit: 10000 },
        getAuthHeaders
      );
      return result.items || [];
    } catch (err) {
      console.error("Error fetching all branch items:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch all items"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentBranch, getAuthHeaders]);

  const getInventorySummary = useCallback(async () => {
    if (!isAuthenticated || !currentBranch) {
      return {
        totalItems: 0,
        activeProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        categories: [],
        totalStockValue: 0,
      };
    }
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/reports/inventory?branchId=${currentBranch.id}`,
        { headers }
      );
      return response.data;
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
  }, [isAuthenticated, currentBranch, getAuthHeaders]);

  //   const getInventoryReport = useCallback(
  //   async (
  //     startDate?: Date,
  //     endDate?: Date
  //   ): Promise<DailyInventoryReport[]> => {
  //     if (!isAuthenticated || !currentBranch || !startDate || !endDate) {
  //       return [];
  //     }
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // 1. Fetch all items and stock movements for the date range
  //       const allItems = await getAllBranchItems();
  //       const movements = await getStockMovements({ startDate, endDate });

  //       // 2. Process movements to build the report
  //       const reportMap = new Map<string, Map<string, DetailedInventoryReportItem>>();

  //       // Get all unique dates from movements
  //       const allDates = new Set<string>();
  //       movements.forEach((movement: any) => {
  //         const date = new Date(movement.createdAt).toISOString().split("T")[0];
  //         allDates.add(date);
  //       });

  //       // Initialize report map with all items for each date
  //       allDates.forEach(date => {
  //         const dailyItems = new Map<string, DetailedInventoryReportItem>();
  //         allItems.forEach(item => {
  //           dailyItems.set(item.id, {
  //             itemId: item.id,
  //             itemName: item.name || "Unknown Item",
  //             openingStock: 0,
  //             stockAdded: 0,
  //             stockRemoved: 0,
  //             closingStock: 0,
  //           });
  //         });
  //         reportMap.set(date, dailyItems);
  //       });

  //       // Process each movement to update the report
  //       movements.forEach((movement: any) => {
  //         const date = new Date(movement.createdAt).toISOString().split("T")[0];
  //         const dailyItems = reportMap.get(date);

  //         if (!dailyItems) return;

  //         const itemInfo = allItems.find(item => item.id === movement.itemId);

  //         // Convert string values to numbers
  //         const quantityChange = parseFloat(movement.quantity) || 0;
  //         const previousStock = parseFloat(movement.previousStock) || 0;
  //         const newStock = parseFloat(movement.newStock) || 0;

  //         // Get or create the report item for this movement
  //         let reportItem = dailyItems.get(movement.itemId);
  //         if (!reportItem) {
  //           reportItem = {
  //             itemId: movement.itemId,
  //             itemName: itemInfo?.name || "Unknown Item",
  //             openingStock: previousStock,
  //             stockAdded: 0,
  //             stockRemoved: 0,
  //             closingStock: newStock,
  //           };
  //           dailyItems.set(movement.itemId, reportItem);
  //         }

  //         // Update opening stock from the first movement of the day
  //         if (reportItem.openingStock === 0) {
  //           reportItem.openingStock = previousStock;
  //         }

  //         // Determine if it's stock added or removed based on movement type
  //         if (movement.type === 'in' || (movement.type === 'adjustment' && quantityChange > 0)) {
  //           reportItem.stockAdded += Math.abs(quantityChange);
  //         } else if (movement.type === 'out' || (movement.type === 'adjustment' && quantityChange < 0)) {
  //           reportItem.stockRemoved += Math.abs(quantityChange);
  //         }

  //         // Update closing stock to the latest movement's newStock
  //         reportItem.closingStock = newStock;
  //       });

  //       // 3. Convert map to array structure expected by the component
  //       const reportData: DailyInventoryReport[] = [];
  //       for (const [date, itemsMap] of reportMap.entries()) {
  //         reportData.push({
  //           date,
  //           items: Array.from(itemsMap.values()),
  //         });
  //       }

  //       // Sort by date descending
  //       reportData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  //       return reportData;

  //     } catch (err) {
  //       setError(
  //         err instanceof Error
  //           ? err.message
  //           : "Failed to generate detailed inventory report"
  //       );
  //       console.error("Inventory report error:", err);
  //       throw err;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [isAuthenticated, currentBranch, getAuthHeaders, getAllBranchItems, getStockMovements]
  // );

  const getInventoryReport = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      productId?: string
    ): Promise<DailyInventoryReport[]> => {
      if (!isAuthenticated || !currentBranch) {
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const response = await itemHttpClient.getInventoryReport(
          currentBranch.id,
          startDate,
          endDate,
          getAuthHeaders,
          productId
        );
        return response.data;
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
    },
    [isAuthenticated, currentBranch, getAuthHeaders]
  );

  const syncData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();

      const response = await httpClient("/sync/", {
        method: "POST",
        body: JSON.stringify({
          branchId: currentBranch?.id,
          lastSync: new Date().toISOString(),
        }),
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });

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
  }, [currentBranch, getAuthHeaders]);

  const getTodaysSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => {
        try {
          return t.timestamp && new Date(t.timestamp) >= today;
        } catch {
          return false;
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
    const now = new Date();

    // Get the first day of the current month at 00:00:00
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get the last day of the current month at 23:59:59.999
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return transactions
      .filter((t) => {
        try {
          if (!t?.timestamp) return false;

          const transactionDate = new Date(t.timestamp);
          return (
            transactionDate >= firstDayOfMonth &&
            transactionDate <= lastDayOfMonth
          );
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const getLast30DaysSales = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => {
        try {
          return t?.timestamp && new Date(t.timestamp) >= thirtyDaysAgo;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSalesForSpecificMonth = (year?: number, month?: number) => {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month !== undefined ? month : new Date().getMonth();

    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const lastDayOfMonth = new Date(
      targetYear,
      targetMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    return transactions
      .filter((t) => {
        try {
          if (!t?.timestamp) return false;

          const transactionDate = new Date(t.timestamp);
          return (
            transactionDate >= firstDayOfMonth &&
            transactionDate <= lastDayOfMonth
          );
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Usage:
  // getMonthlySales() - current month
  // getMonthlySales(2024, 2) - March 2024 (month is 0-indexed)
  // getMonthlySales(2024, 11) - December 2024
  const getQuarterlySales = () => {
    const quarterAgo = new Date();
    quarterAgo.setMonth(quarterAgo.getMonth() - 3);

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
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

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

  const produceItem = useCallback(
    async (
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
        throw new Error(
          `Item ${processedItem.name} is not a processable item.`
        );
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
      const updatedItemsBatch: Item[] = [];

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
          id: `sm_${new Date().toISOString()}_input_${rawMaterialItem.id}`,
          itemId: rawMaterialItem.id,
          item: {
            id: rawMaterialItem.id,
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

        updatedItemsBatch.push({
          ...rawMaterialItem,
          stockQuantity:
            (rawMaterialItem.stockQuantity || 0) - totalQuantityNeeded,
        });
      }

      const outputMovement: StockMovement = {
        id: `sm_${new Date().toISOString()}_output_${processedItem.id}`,
        itemId: processedItem.id,
        item: {
          id: processedItem.id,
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

      updatedItemsBatch.push({
        ...processedItem,
        stockQuantity: (processedItem.stockQuantity || 0) + quantityToProduce,
      });

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

      console.log("Production successful: ", {
        inputMovements,
        outputMovement,
      });
      return { inputMovements, outputMovement };
    },
    [currentBranch, user, items]
  );

  const getLowStockItems = useCallback((): Item[] => {
    return items.filter((item) => {
      if (item.stockQuantity === undefined || item.minStockLevel === undefined)
        return false;
      return item.stockQuantity <= item.minStockLevel;
    });
  }, [items]);

  const getOutOfStockItems = useCallback((): Item[] => {
    return items.filter((item) => {
      if (item.stockQuantity === undefined) return false;
      return item.stockQuantity <= 0;
    });
  }, [items]);

  const getStockValue = useCallback(() => {
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
  }, [items]);

  const getItemsByBranch = useCallback((): Item[] => {
    if (!currentBranch) return [];
    const branchItems = items.filter(
      (item) => item.branchId === currentBranch.id
    );
    return branchItems;
  }, [items, currentBranch]);

  const getItemByBarcode = useCallback(
    async (barcode: string): Promise<Item | null> => {
      try {
        setLoading(true);
        setError(null);

        if (!currentBranch) {
          throw new Error("No branch selected");
        }

        const item = await itemHttpClient.getItemByBarcode(
          barcode,
          currentBranch.id,
          getAuthHeaders
        );
        return item;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch item by barcode"
        );
        console.error("Item fetch by barcode error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentBranch, getAuthHeaders]
  );

  const getTotalProfit = useCallback((): number => {
    return items.reduce((sum, item) => {
      const profit = (item.profitPerUnit || 0) * (item.stockQuantity || 0);
      return sum + profit;
    }, 0);
  }, [items]);

  const getProfitAnalysis = useCallback(
    async (
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
    },
    [getAuthHeaders]
  );

  const getQuickProfitSummary = useCallback(
    async (
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
    },
    [getAuthHeaders]
  );

  const getAllBranchesProfitComparison = useCallback(
    async (startDate: Date, endDate: Date) => {
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
    },
    [getAuthHeaders]
  );
  // Store Methods
  const getStoresByBranch = useCallback(
    async (
      branchId: string,
      filters?: { isActive?: boolean; isWarehouse?: boolean }
    ): Promise<Store[]> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        const stores = await storeApi.getStoresByBranch(branchId, filters);
        return stores;
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const createStore = useCallback(
    async (storeData: {
      name: string;
      description?: string;
      address?: string;
      phone?: string;
      branchId: string;
      managerId?: string;
      isWarehouse?: boolean;
    }): Promise<Store> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        const newStore = await storeApi.createStore(storeData);
        setStores((prev) => [...prev, newStore]);
        return newStore;
      } catch (err) {
        console.error("Failed to create store:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const updateStore = useCallback(
    async (id: string, storeData: Partial<Store>): Promise<Store> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        const updatedStore = await storeApi.updateStore(id, storeData);
        setStores((prev) =>
          prev.map((store) => (store.id === id ? updatedStore : store))
        );
        return updatedStore;
      } catch (err) {
        console.error("Failed to update store:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const deleteStore = useCallback(
    async (id: string): Promise<void> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        await storeApi.deleteStore(id);
        setStores((prev) => prev.filter((store) => store.id !== id));
        if (currentStore?.id === id) {
          setCurrentStore(null);
        }
      } catch (err) {
        console.error("Failed to delete store:", err);
        throw err;
      }
    },
    [getAuthHeaders, currentStore]
  );

  // Store Items Methods
  const getStoreItems = useCallback(
    async (
      storeId: string,
      filters?: { lowStock?: boolean; outOfStock?: boolean }
    ): Promise<StoreItem[]> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.getStoreItems(storeId, filters);
      } catch (err) {
        console.error("Failed to fetch store items:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const addItemToStore = useCallback(
    async (
      storeId: string,
      itemId: string,
      quantity: number = 0,
      minStockLevel: number = 0,
      maxStockLevel: number = 0
    ): Promise<StoreItem> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.addItemToStore(
          storeId,
          itemId,
          quantity,
          minStockLevel,
          maxStockLevel
        );
      } catch (err) {
        console.error("Failed to add item to store:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const updateStoreItemQuantity = useCallback(
    async (
      storeId: string,
      itemId: string,
      quantity: number
    ): Promise<StoreItem> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.updateStoreItemQuantity(
          storeId,
          itemId,
          quantity
        );
      } catch (err) {
        console.error("Failed to update store item quantity:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  // Stock Transfer
  const transferStock = useCallback(
    async (
      transferData: StockTransferRequest
    ): Promise<{ fromStoreItem: StoreItem; toStoreItem: StoreItem }> => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.transferStock(transferData);
      } catch (err) {
        console.error("Failed to transfer stock:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  // Reports
  const getStoreStockSummary = useCallback(
    async (storeId: string) => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.getStoreStockSummary(storeId);
      } catch (err) {
        console.error("Failed to get store stock summary:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const getItemStockAcrossStores = useCallback(
    async (itemId: string, branchId: string) => {
      try {
        const storeApi = createStoreApi(getAuthHeaders);
        return await storeApi.getItemStockAcrossStores(itemId, branchId);
      } catch (err) {
        console.error("Failed to get item stock across stores:", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );
  const value: DataContextType = {
    transactions,
    items,
    stockMovements,
    stockSummary,
    loading,
    error,
    hasMoreItems,
    isFetchingMoreItems,
    loadMoreItems,
    totalItems,
    hasMoreTransactions,
    isFetchingMoreTransactions,
    loadMoreTransactions,
    totalTransactions,
    totalPages,
    currentPage,
    produceItem,

    createTransaction,
    createAgroTransaction,
    createCustomAmountTransaction,
    getTransactions,
    deleteTransaction,
    createItem,
    getItem,
    getItemByBarcode,
    updateItem,
    deleteItem,
    getItems,
    findExistingItem,
    bulkUploadItems,
    restockItem,
    getStockMovements,
    getMonthlyStockMovements,

    getSalesReport,
    getInventorySummary,
    getInventoryReport,

    syncData,
    getTodaysSales,
    getWeeklySales,
    getMonthlySales,
    getLast30DaysSales,
    // getSalesForSpecificMonth,
    getQuarterlySales,
    getYearlySales,

    getLowStockItems,
    getOutOfStockItems,
    getStockValue,
    getItemsByBranch,
    getTotalProfit,
    getAllBranchItems,

    getProfitAnalysis,
    getQuickProfitSummary,
    getAllBranchesProfitComparison,

    // Store Management
    stores,
    currentStore,
    setCurrentStore,

    // Store Methods
    getStoresByBranch,
    createStore,
    updateStore,
    deleteStore,

    // Store Items
    getStoreItems,
    addItemToStore,
    updateStoreItemQuantity,

    // Stock Operations
    transferStock,

    // Reports
    getStoreStockSummary,
    getItemStockAcrossStores,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
