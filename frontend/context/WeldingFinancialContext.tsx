/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import {
  WeldingQuote,
  WeldingInvoice,
  QuoteStatus,
  InvoicePaymentStatus,
  LineItem,
  Payment,
  CustomerSnapshot,
} from "@/src/types/weldingFinancials";
import { v4 as uuidv4 } from "uuid";
import { WeldingJob } from "@/src/types/welding";
import { httpClient } from "@/src/data/api/httpClient";
interface WeldingFinancialContextType {
  quotes: WeldingQuote[];
  invoices: WeldingInvoice[];
  loadingQuotes: boolean;
  loadingInvoices: boolean;
  errorQuotes: string | null;
  errorInvoices: string | null;
  createQuote: (
    job: WeldingJob,
    lineItems: LineItem[],
    notes?: string,
    validUntil?: Date
  ) => Promise<WeldingQuote | null>;
  getQuoteById: (quoteId: string) => WeldingQuote | undefined;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<void>;
  updateQuote: (
    quoteId: string,
    updates: {
      lineItems: LineItem[];
      notes?: string;
      validUntil?: Date;
      status?: QuoteStatus;
    }
  ) => Promise<WeldingQuote | null>;
  deleteQuote: (quoteId: string) => Promise<void>;

  createInvoiceFromQuote: (
    quote: WeldingQuote,
    issueDate?: Date,
    dueDate?: Date,
    includeTax?: boolean
  ) => Promise<WeldingInvoice | null>;
  createStandaloneInvoice: (
    job: WeldingJob,
    lineItems: LineItem[],
    issueDate?: Date,
    dueDate?: Date,
    notes?: string,
    includeTax?: boolean
  ) => Promise<WeldingInvoice | null>;
  getInvoiceById: (invoiceId: string) => WeldingInvoice | undefined;
  recordPaymentForInvoice: (
    invoiceId: string,
    payment: Omit<Payment, "id">
  ) => Promise<Payment | null>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  fetchQuotes: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  syncQuotesWithBackend: () => Promise<void>;
  syncInvoicesWithBackend: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

const WeldingFinancialContext = createContext<
  WeldingFinancialContextType | undefined
>(undefined);

const WELDING_QUOTES_STORAGE_KEY = "@SimuPOS_WeldingQuotes";
const WELDING_INVOICES_STORAGE_KEY = "@SimuPOS_WeldingInvoices";
// const WELDING_FINANCIAL_PENDING_OPS = "@SimuPOS_WeldingFinancialPendingOps";

export const WeldingFinancialProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, currentBranchId, getAuthHeaders } = useAuth();
  const [quotes, setQuotes] = useState<WeldingQuote[]>([]);
  const [invoices, setInvoices] = useState<WeldingInvoice[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState<boolean>(true);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);
  const [errorQuotes, setErrorQuotes] = useState<string | null>(null);
  const [errorInvoices, setErrorInvoices] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const branchId = currentBranchId;

  // Client-side storage functions
  const getLocalStorageItem = async (key: string) => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setLocalStorageItem = async (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const removeLocalStorageItem = async (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  };

  // Save quotes to local storage whenever they change
  useEffect(() => {
    const saveQuotes = async () => {
      try {
        await setLocalStorageItem(WELDING_QUOTES_STORAGE_KEY, quotes);
      } catch (err) {
        console.error("Failed to save quotes locally:", err);
      }
    };
    saveQuotes();
  }, [quotes]);

  // Save invoices to local storage whenever they change
  useEffect(() => {
    const saveInvoices = async () => {
      try {
        await setLocalStorageItem(WELDING_INVOICES_STORAGE_KEY, invoices);
      } catch (err) {
        console.error("Failed to save invoices locally:", err);
      }
    };
    saveInvoices();
  }, [invoices]);

  // Quote operations
  const fetchQuotes = useCallback(async () => {
    if (!branchId) return;

    setLoadingQuotes(true);
    setErrorQuotes(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(`/welding/quotes/branch/${branchId}`, {
        headers,
      });

      if (response?.quotes) {
        setQuotes(response.quotes);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch quotes from backend:", err);
      setErrorQuotes("Failed to fetch quotes from server. Using local data.");
      const storedQuotes = await getLocalStorageItem(
        WELDING_QUOTES_STORAGE_KEY
      );
      if (storedQuotes) {
        setQuotes(storedQuotes);
      }
    } finally {
      setLoadingQuotes(false);
    }
  }, [branchId, getAuthHeaders]);

  const createQuote = async (
    job: WeldingJob,
    lineItems: LineItem[],
    notes?: string,
    validUntil?: Date
  ) => {
    const customerDetails: CustomerSnapshot = {
      name: job.customerName,
      contact: job.customerContact,
      location: job.customerLocation,
    };

    const newQuote: WeldingQuote = {
      id: uuidv4(),
      weldingJobId: job.id,
      quoteNumber: `QT-${job.id.substring(0, 4)}-${quotes.filter((q) => q.weldingJobId === job.id).length + 1}`,
      customerDetails,
      lineItems,
      subTotal: lineItems.reduce((sum, item) => sum + item.total, 0),
      taxRate: 0.18,
      taxAmount: lineItems.reduce((sum, item) => sum + item.total, 0) * 0.18,
      totalAmount: lineItems.reduce((sum, item) => sum + item.total, 0) * 1.18,
      validUntil: validUntil ? validUntil.toISOString() : undefined,
      notes,
      status: QuoteStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/welding/quotes/job/${job.id}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            customerDetails,
            lineItems: lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              materialDetails: item.materialDetails,
            })),
            notes,
            validUntil,
          }),
        });

        setQuotes((prev) => [...prev, response]);
        return response;
      } else {
        setQuotes((prev) => [...prev, newQuote]);
        return newQuote;
      }
    } catch (err) {
      console.error("Failed to create quote on server:", err);
      setQuotes((prev) => [...prev, newQuote]);
      return newQuote;
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: QuoteStatus) => {
    const updatedQuotes = quotes.map((q) =>
      q.id === quoteId
        ? { ...q, status, updatedAt: new Date().toISOString() }
        : q
    );
    setQuotes(updatedQuotes);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/quotes/${quoteId}/status`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        });
      }
    } catch (err) {
      console.error("Failed to update quote status on server:", err);
    }
  };

  const getQuoteById = (quoteId: string) => {
    return quotes.find((q) => q.id === quoteId);
  };

  const updateQuote = async (
    quoteId: string,
    updates: {
      lineItems: LineItem[];
      notes?: string;
      validUntil?: Date;
      status?: QuoteStatus;
    }
  ) => {
    const existingQuote = quotes.find((q) => q.id === quoteId);
    if (!existingQuote) {
      toast({
        title: "Error",
        description: "Quote not found",
        variant: "destructive",
      });
      return null;
    }

    // Calculate new totals
    const subTotal = updates.lineItems.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const taxAmount = subTotal * (existingQuote.taxRate ?? 0.18);
    const totalAmount = subTotal + taxAmount;

    const updatedQuote: WeldingQuote = {
      ...existingQuote,
      lineItems: updates.lineItems,
      subTotal,
      taxAmount,
      totalAmount,
      notes: updates.notes ?? existingQuote.notes,
      validUntil: updates.validUntil
        ? updates.validUntil.toISOString()
        : existingQuote.validUntil,
      status: updates.status ?? existingQuote.status,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const response = await httpClient(`/welding/quotes/${quoteId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            lineItems: updates.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              materialDetails: item.materialDetails,
            })),
            notes: updates.notes,
            validUntil: updates.validUntil,
            status: updates.status,
          }),
        });

        setQuotes((prev) => prev.map((q) => (q.id === quoteId ? response : q)));
        return response;
      } else {
        setQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? updatedQuote : q))
        );
        return updatedQuote;
      }
    } catch (err) {
      console.error("Failed to update quote on server:", err);
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? updatedQuote : q))
      );
      return updatedQuote;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/quotes/${quoteId}`, {
          method: "DELETE",
          headers,
        });
      }

      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
    } catch (err) {
      console.error("Failed to delete quote:", err);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive",
      });
    }
  };

  // Invoice operations
  const fetchInvoices = useCallback(async () => {
    if (!branchId) return;

    setLoadingInvoices(true);
    setErrorInvoices(null);
    try {
      const headers = await getAuthHeaders();
      const response = await httpClient(
        `/welding/invoices/branch/${branchId}`,
        { headers }
      );
      if (response?.invoices) {
        setInvoices(response.invoices);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch invoices from backend:", err);
      setErrorInvoices(
        "Failed to fetch invoices from server. Using local data."
      );
      const storedInvoices = await getLocalStorageItem(
        WELDING_INVOICES_STORAGE_KEY
      );
      if (storedInvoices) {
        setInvoices(storedInvoices);
      }
    } finally {
      setLoadingInvoices(false);
    }
  }, [branchId, getAuthHeaders]);

  // Load initial data from local storage
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingQuotes(true);
      setLoadingInvoices(true);

      // Load quotes from local storage
      const storedQuotes = await getLocalStorageItem(
        WELDING_QUOTES_STORAGE_KEY
      );
      if (storedQuotes) {
        setQuotes(storedQuotes);
      }

      // Load invoices from local storage
      const storedInvoices = await getLocalStorageItem(
        WELDING_INVOICES_STORAGE_KEY
      );
      if (storedInvoices) {
        setInvoices(storedInvoices);
      }

      // Try to sync with backend if online
      if (user && branchId) {
        await Promise.all([fetchQuotes(), fetchInvoices()]);
      }
    } catch (err) {
      console.error("Failed to load initial financial data:", err);
      setErrorQuotes("Failed to load quotes");
      setErrorInvoices("Failed to load invoices");
    } finally {
      setLoadingQuotes(false);
      setLoadingInvoices(false);
    }
  }, [user, branchId, fetchQuotes, fetchInvoices]);
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const createInvoiceFromQuote = async (
    quote: WeldingQuote,
    issueDate?: Date,
    dueDate?: Date,
    includeTax: boolean = true
  ) => {
    if (
      quote.status !== QuoteStatus.ACCEPTED &&
      quote.status !== QuoteStatus.SENT
    ) {
      toast({
        title: "Invalid Action",
        description:
          "Invoice can only be created from an accepted or sent quote.",
        variant: "destructive",
      });
      return null;
    }

    // Calculate tax amounts based on includeTax parameter
    const taxRate = includeTax ? quote.taxRate : 0;
    const taxAmount = includeTax ? quote.taxAmount : 0;
    const totalAmount = includeTax ? quote.totalAmount : quote.subTotal;
    const newInvoice: WeldingInvoice = {
      id: uuidv4(),
      weldingJobId: quote.weldingJobId,
      quoteId: quote.id,
      invoiceNumber: `INV-${quote.weldingJobId.substring(0, 4)}-${invoices.filter((i) => i.weldingJobId === quote.weldingJobId).length + 1}`,
      customerDetails: quote.customerDetails,
      lineItems: quote.lineItems,
      subTotal: quote.subTotal,
      taxRate, // Use the calculated taxRate
      taxAmount, // Use the calculated taxAmount
      totalAmount, // Use the calculated totalAmount
      amountPaid: 0,
      balanceDue: quote.totalAmount,
      issueDate: issueDate ? issueDate.toISOString() : new Date().toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      paymentsMade: [],
      paymentStatus: InvoicePaymentStatus.UNPAID,
      notes: quote.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/welding/invoices/from-quote/${quote.id}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              issueDate,
              dueDate,
              includeTax,
            }),
          }
        );

        setInvoices((prev) => [...prev, response]);
        await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
        return response;
      } else {
        setInvoices((prev) => [...prev, newInvoice]);
        await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
        return newInvoice;
      }
    } catch (err) {
      console.error("Failed to create invoice from quote on server:", err);
      setInvoices((prev) => [...prev, newInvoice]);
      await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
      return newInvoice;
    }
  };

  const createStandaloneInvoice = async (
    job: WeldingJob,
    lineItems: LineItem[],
    issueDate?: Date,
    dueDate?: Date,
    notes?: string,
    includeTax: boolean = true
  ) => {
    const customerDetails: CustomerSnapshot = {
      name: job.customerName,
      contact: job.customerContact,
      location: job.customerLocation,
    };

    // Calculate the subtotal from line items
    const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax and total based on includeTax parameter
    const taxRate = includeTax ? 0.18 : 0;
    const taxAmount = includeTax ? subTotal * taxRate : 0;
    const totalAmount = subTotal + taxAmount;

    const newInvoice: WeldingInvoice = {
      id: uuidv4(),
      weldingJobId: job.id,
      invoiceNumber: `INV-${job.id.substring(0, 4)}-${invoices.filter((i) => i.weldingJobId === job.id).length + 1}`,
      customerDetails,
      lineItems,
      subTotal,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      issueDate: issueDate ? issueDate.toISOString() : new Date().toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      paymentsMade: [],
      paymentStatus: InvoicePaymentStatus.UNPAID,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const response = await httpClient(
          `/welding/invoices/standalone/job/${job.id}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              customerDetails,
              lineItems: lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                materialDetails: item.materialDetails,
              })),
              issueDate,
              dueDate,
              notes,
              includeTax, // Include the tax parameter in the API call
            }),
          }
        );

        setInvoices((prev) => [...prev, response]);

        return response;
      } else {
        setInvoices((prev) => [...prev, newInvoice]);
        return newInvoice;
      }
    } catch (err) {
      console.error("Failed to create standalone invoice on server:", err);
      setInvoices((prev) => [...prev, newInvoice]);
      return newInvoice;
    }
  };

  const getInvoiceById = (invoiceId: string) => {
    return invoices.find((inv) => inv.id === invoiceId);
  };

  const recordPaymentForInvoice = async (
    invoiceId: string,
    payment: Omit<Payment, "id">
  ): Promise<Payment | null> => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) {
      toast({
        title: "Error",
        description: "Invoice not found.",
        variant: "destructive",
      });
      return null;
    }

    const newPayment: Payment = { ...payment, id: uuidv4() };
    const updatedPayments = [...(invoice.paymentsMade || []), newPayment];
    const newAmountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const newBalanceDue = invoice.totalAmount - newAmountPaid;

    let newPaymentStatus = InvoicePaymentStatus.PARTIALLY_PAID;
    if (newBalanceDue <= 0) {
      newPaymentStatus = InvoicePaymentStatus.PAID;
    } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      newPaymentStatus = InvoicePaymentStatus.OVERDUE;
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId
        ? {
            ...inv,
            paymentsMade: updatedPayments,
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            paymentStatus: newPaymentStatus,
            updatedAt: new Date().toISOString(),
          }
        : inv
    );
    setInvoices(updatedInvoices);

    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        const serverPayment = await httpClient(
          `/welding/invoices/${invoiceId}/payments`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payment),
          }
        );
        return serverPayment;
      }
      return newPayment;
    } catch (err) {
      console.error("Failed to record payment on server:", err);
      // even if server fails, return local payment to navigate
      return newPayment;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      if (user && branchId) {
        const headers = await getAuthHeaders();
        await httpClient(`/welding/invoices/${invoiceId}`, {
          method: "DELETE",
          headers,
        });
      }

      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  // Sync operations
  const syncQuotesWithBackend = async () => {
    if (!user || !branchId) return;

    setIsSyncing(true);
    try {
      await fetchQuotes();
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to sync quotes:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncInvoicesWithBackend = async () => {
    if (!user || !branchId) return;

    setIsSyncing(true);
    try {
      await fetchInvoices();
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to sync invoices:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <WeldingFinancialContext.Provider
      value={{
        quotes,
        invoices,
        loadingQuotes,
        loadingInvoices,
        errorQuotes,
        errorInvoices,
        createQuote,
        getQuoteById,
        updateQuoteStatus,
        updateQuote,
        deleteQuote,
        createInvoiceFromQuote,
        createStandaloneInvoice,
        getInvoiceById,
        deleteInvoice,
        recordPaymentForInvoice,
        fetchQuotes,
        fetchInvoices,
        syncQuotesWithBackend,
        syncInvoicesWithBackend,
        isSyncing,
        lastSyncTime,
      }}
    >
      {children}
    </WeldingFinancialContext.Provider>
  );
};

export const useWeldingFinancials = (): WeldingFinancialContextType => {
  const context = useContext(WeldingFinancialContext);
  if (!context) {
    throw new Error(
      "useWeldingFinancials must be used within a WeldingFinancialProvider"
    );
  }
  return context;
};

// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";
// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
// } from "react";
// import { toast } from "@/components/ui/use-toast";
// import { useAuth } from "./AuthContext";
// import {
//   WeldingQuote,
//   WeldingInvoice,
//   QuoteStatus,
//   InvoicePaymentStatus,
//   LineItem,
//   Payment,
//   CustomerSnapshot,
// } from "@/src/types/weldingFinancials";
// import { v4 as uuidv4 } from "uuid";
// import { WeldingJob } from "@/src/types/welding";
// import { httpClient } from "@/src/data/api/httpClient";
// interface WeldingFinancialContextType {
//   quotes: WeldingQuote[];
//   invoices: WeldingInvoice[];
//   loadingQuotes: boolean;
//   loadingInvoices: boolean;
//   errorQuotes: string | null;
//   errorInvoices: string | null;
//   createQuote: (
//     job: WeldingJob,
//     lineItems: LineItem[],
//     notes?: string,
//     validUntil?: Date
//   ) => Promise<WeldingQuote | null>;
//   getQuoteById: (quoteId: string) => WeldingQuote | undefined;
//   updateQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<void>;
//   updateQuote: (
//     quoteId: string,
//     updates: {
//       lineItems: LineItem[];
//       notes?: string;
//       validUntil?: Date;
//       status?: QuoteStatus;
//     }
//   ) => Promise<WeldingQuote | null>;
//   deleteQuote: (quoteId: string) => Promise<void>;

//   createInvoiceFromQuote: (
//     quote: WeldingQuote,
//     issueDate?: Date,
//     dueDate?: Date,
//     includeTax?: boolean
//   ) => Promise<WeldingInvoice | null>;
//   createStandaloneInvoice: (
//     job: WeldingJob,
//     lineItems: LineItem[],
//     issueDate?: Date,
//     dueDate?: Date,
//     notes?: string,
//     includeTax?: boolean
//   ) => Promise<WeldingInvoice | null>;
//   getInvoiceById: (invoiceId: string) => WeldingInvoice | undefined;
//   recordPaymentForInvoice: (
//     invoiceId: string,
//     payment: Omit<Payment, "id">
//   ) => Promise<Payment | null>;
//   deleteInvoice: (invoiceId: string) => Promise<void>;
//   fetchQuotes: () => Promise<void>;
//   fetchInvoices: () => Promise<void>;
//   syncQuotesWithBackend: () => Promise<void>;
//   syncInvoicesWithBackend: () => Promise<void>;
//   isSyncing: boolean;
//   lastSyncTime: Date | null;
// }

// const WeldingFinancialContext = createContext<
//   WeldingFinancialContextType | undefined
// >(undefined);

// const WELDING_QUOTES_STORAGE_KEY = "@SimuPOS_WeldingQuotes";
// const WELDING_INVOICES_STORAGE_KEY = "@SimuPOS_WeldingInvoices";
// // const WELDING_FINANCIAL_PENDING_OPS = "@SimuPOS_WeldingFinancialPendingOps";

// export const WeldingFinancialProvider: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => {
//   const { user, currentBranchId, getAuthHeaders } = useAuth();
//   const [quotes, setQuotes] = useState<WeldingQuote[]>([]);
//   const [invoices, setInvoices] = useState<WeldingInvoice[]>([]);
//   const [loadingQuotes, setLoadingQuotes] = useState<boolean>(true);
//   const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);
//   const [errorQuotes, setErrorQuotes] = useState<string | null>(null);
//   const [errorInvoices, setErrorInvoices] = useState<string | null>(null);
//   const [isSyncing, setIsSyncing] = useState<boolean>(false);
//   const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
//   const branchId = currentBranchId;

//   // Client-side storage functions
//   const getLocalStorageItem = async (key: string) => {
//     if (typeof window !== "undefined") {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : null;
//     }
//     return null;
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const setLocalStorageItem = async (key: string, value: any) => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem(key, JSON.stringify(value));
//     }
//   };

//   const removeLocalStorageItem = async (key: string) => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem(key);
//     }
//   };

//   // Load initial data from local storage
//   const loadInitialData = useCallback(async () => {
//     try {
//       setLoadingQuotes(true);
//       setLoadingInvoices(true);

//       // Load quotes from local storage
//       const storedQuotes = await getLocalStorageItem(
//         WELDING_QUOTES_STORAGE_KEY
//       );
//       if (storedQuotes) {
//         setQuotes(storedQuotes);
//       }

//       // Load invoices from local storage
//       const storedInvoices = await getLocalStorageItem(
//         WELDING_INVOICES_STORAGE_KEY
//       );
//       if (storedInvoices) {
//         setInvoices(storedInvoices);
//       }

//       // Try to sync with backend if online
//       if (user && branchId) {
//         await Promise.all([fetchQuotes(), fetchInvoices()]);
//       }
//     } catch (err) {
//       console.error("Failed to load initial financial data:", err);
//       setErrorQuotes("Failed to load quotes");
//       setErrorInvoices("Failed to load invoices");
//     } finally {
//       setLoadingQuotes(false);
//       setLoadingInvoices(false);
//     }
//   }, [user, branchId]);

//   useEffect(() => {
//     loadInitialData();
//   }, [loadInitialData]);

//   // Save quotes to local storage whenever they change
//   useEffect(() => {
//     const saveQuotes = async () => {
//       try {
//         await setLocalStorageItem(WELDING_QUOTES_STORAGE_KEY, quotes);
//       } catch (err) {
//         console.error("Failed to save quotes locally:", err);
//       }
//     };
//     saveQuotes();
//   }, [quotes]);

//   // Save invoices to local storage whenever they change
//   useEffect(() => {
//     const saveInvoices = async () => {
//       try {
//         await setLocalStorageItem(WELDING_INVOICES_STORAGE_KEY, invoices);
//       } catch (err) {
//         console.error("Failed to save invoices locally:", err);
//       }
//     };
//     saveInvoices();
//   }, [invoices]);

//   // Quote operations
//   const fetchQuotes = useCallback(async () => {
//     if (!branchId) return;

//     setLoadingQuotes(true);
//     setErrorQuotes(null);
//     try {
//       const headers = await getAuthHeaders();
//       const response = await httpClient(`/welding/quotes/branch/${branchId}`, {
//         headers,
//       });

//       if (response?.quotes) {
//         setQuotes(response.quotes);
//         setLastSyncTime(new Date());
//       }
//     } catch (err) {
//       console.error("Failed to fetch quotes from backend:", err);
//       setErrorQuotes("Failed to fetch quotes from server. Using local data.");
//       const storedQuotes = await getLocalStorageItem(
//         WELDING_QUOTES_STORAGE_KEY
//       );
//       if (storedQuotes) {
//         setQuotes(storedQuotes);
//       }
//     } finally {
//       setLoadingQuotes(false);
//     }
//   }, [branchId, getAuthHeaders]);

//   const createQuote = async (
//     job: WeldingJob,
//     lineItems: LineItem[],
//     notes?: string,
//     validUntil?: Date
//   ) => {
//     const customerDetails: CustomerSnapshot = {
//       name: job.customerName,
//       contact: job.customerContact,
//       location: job.customerLocation,
//     };

//     const newQuote: WeldingQuote = {
//       id: uuidv4(),
//       weldingJobId: job.id,
//       quoteNumber: `QT-${job.id.substring(0, 4)}-${quotes.filter((q) => q.weldingJobId === job.id).length + 1}`,
//       customerDetails,
//       lineItems,
//       subTotal: lineItems.reduce((sum, item) => sum + item.total, 0),
//       taxRate: 0.18,
//       taxAmount: lineItems.reduce((sum, item) => sum + item.total, 0) * 0.18,
//       totalAmount: lineItems.reduce((sum, item) => sum + item.total, 0) * 1.18,
//       validUntil: validUntil ? validUntil.toISOString() : undefined,
//       notes,
//       status: QuoteStatus.DRAFT,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         const response = await httpClient(`/welding/quotes/job/${job.id}`, {
//           method: "POST",
//           headers,
//           body: JSON.stringify({
//             customerDetails,
//             lineItems: lineItems.map((item) => ({
//               description: item.description,
//               quantity: item.quantity,
//               unitPrice: item.unitPrice,
//               materialDetails: item.materialDetails,
//             })),
//             notes,
//             validUntil,
//           }),
//         });

//         setQuotes((prev) => [...prev, response]);
//         return response;
//       } else {
//         setQuotes((prev) => [...prev, newQuote]);
//         return newQuote;
//       }
//     } catch (err) {
//       console.error("Failed to create quote on server:", err);
//       setQuotes((prev) => [...prev, newQuote]);
//       return newQuote;
//     }
//   };

//   const updateQuoteStatus = async (quoteId: string, status: QuoteStatus) => {
//     const updatedQuotes = quotes.map((q) =>
//       q.id === quoteId
//         ? { ...q, status, updatedAt: new Date().toISOString() }
//         : q
//     );
//     setQuotes(updatedQuotes);

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         await httpClient(`/welding/quotes/${quoteId}/status`, {
//           method: "PATCH",
//           headers,
//           body: JSON.stringify({ status }),
//         });
//       }
//     } catch (err) {
//       console.error("Failed to update quote status on server:", err);
//     }
//   };

//   const getQuoteById = (quoteId: string) => {
//     return quotes.find((q) => q.id === quoteId);
//   };

//   const updateQuote = async (
//     quoteId: string,
//     updates: {
//       lineItems: LineItem[];
//       notes?: string;
//       validUntil?: Date;
//       status?: QuoteStatus;
//     }
//   ) => {
//     const existingQuote = quotes.find((q) => q.id === quoteId);
//     if (!existingQuote) {
//       toast({
//         title: "Error",
//         description: "Quote not found",
//         variant: "destructive",
//       });
//       return null;
//     }

//     // Calculate new totals
//     const subTotal = updates.lineItems.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );
//     const taxAmount = subTotal * (existingQuote.taxRate ?? 0.18);
//     const totalAmount = subTotal + taxAmount;

//     const updatedQuote: WeldingQuote = {
//       ...existingQuote,
//       lineItems: updates.lineItems,
//       subTotal,
//       taxAmount,
//       totalAmount,
//       notes: updates.notes ?? existingQuote.notes,
//       validUntil: updates.validUntil
//         ? updates.validUntil.toISOString()
//         : existingQuote.validUntil,
//       status: updates.status ?? existingQuote.status,
//       updatedAt: new Date().toISOString(),
//     };

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         const response = await httpClient(`/welding/quotes/${quoteId}`, {
//           method: "PUT",
//           headers,
//           body: JSON.stringify({
//             lineItems: updates.lineItems.map((item) => ({
//               description: item.description,
//               quantity: item.quantity,
//               unitPrice: item.unitPrice,
//               materialDetails: item.materialDetails,
//             })),
//             notes: updates.notes,
//             validUntil: updates.validUntil,
//             status: updates.status,
//           }),
//         });

//         setQuotes((prev) => prev.map((q) => (q.id === quoteId ? response : q)));
//         return response;
//       } else {
//         setQuotes((prev) =>
//           prev.map((q) => (q.id === quoteId ? updatedQuote : q))
//         );
//         return updatedQuote;
//       }
//     } catch (err) {
//       console.error("Failed to update quote on server:", err);
//       setQuotes((prev) =>
//         prev.map((q) => (q.id === quoteId ? updatedQuote : q))
//       );
//       return updatedQuote;
//     }
//   };

//   const deleteQuote = async (quoteId: string) => {
//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         await httpClient(`/welding/quotes/${quoteId}`, {
//           method: "DELETE",
//           headers,
//         });
//       }

//       setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
//       toast({
//         title: "Success",
//         description: "Quote deleted successfully",
//       });
//     } catch (err) {
//       console.error("Failed to delete quote:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete quote",
//         variant: "destructive",
//       });
//     }
//   };

//   // Invoice operations
//   const fetchInvoices = useCallback(async () => {
//     if (!branchId) return;

//     setLoadingInvoices(true);
//     setErrorInvoices(null);
//     try {
//       const headers = await getAuthHeaders();
//       const response = await httpClient(
//         `/welding/invoices/branch/${branchId}`,
//         { headers }
//       );
//       if (response?.invoices) {
//         setInvoices(response.invoices);
//         setLastSyncTime(new Date());
//       }
//     } catch (err) {
//       console.error("Failed to fetch invoices from backend:", err);
//       setErrorInvoices(
//         "Failed to fetch invoices from server. Using local data."
//       );
//       const storedInvoices = await getLocalStorageItem(
//         WELDING_INVOICES_STORAGE_KEY
//       );
//       if (storedInvoices) {
//         setInvoices(storedInvoices);
//       }
//     } finally {
//       setLoadingInvoices(false);
//     }
//   }, [branchId, getAuthHeaders]);

//   const createInvoiceFromQuote = async (
//     quote: WeldingQuote,
//     issueDate?: Date,
//     dueDate?: Date,
//     includeTax: boolean = true
//   ) => {
//     if (
//       quote.status !== QuoteStatus.ACCEPTED &&
//       quote.status !== QuoteStatus.SENT
//     ) {
//       toast({
//         title: "Invalid Action",
//         description:
//           "Invoice can only be created from an accepted or sent quote.",
//         variant: "destructive",
//       });
//       return null;
//     }

//     // Calculate tax amounts based on includeTax parameter
//     const taxRate = includeTax ? quote.taxRate : 0;
//     const taxAmount = includeTax ? quote.taxAmount : 0;
//     const totalAmount = includeTax ? quote.totalAmount : quote.subTotal;
//     const newInvoice: WeldingInvoice = {
//       id: uuidv4(),
//       weldingJobId: quote.weldingJobId,
//       quoteId: quote.id,
//       invoiceNumber: `INV-${quote.weldingJobId.substring(0, 4)}-${invoices.filter((i) => i.weldingJobId === quote.weldingJobId).length + 1}`,
//       customerDetails: quote.customerDetails,
//       lineItems: quote.lineItems,
//       subTotal: quote.subTotal,
//       taxRate, // Use the calculated taxRate
//       taxAmount, // Use the calculated taxAmount
//       totalAmount, // Use the calculated totalAmount
//       amountPaid: 0,
//       balanceDue: quote.totalAmount,
//       issueDate: issueDate ? issueDate.toISOString() : new Date().toISOString(),
//       dueDate: dueDate ? dueDate.toISOString() : undefined,
//       paymentsMade: [],
//       paymentStatus: InvoicePaymentStatus.UNPAID,
//       notes: quote.notes,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         const response = await httpClient(
//           `/welding/invoices/from-quote/${quote.id}`,
//           {
//             method: "POST",
//             headers,
//             body: JSON.stringify({
//               issueDate,
//               dueDate,
//               includeTax,
//             }),
//           }
//         );

//         setInvoices((prev) => [...prev, response]);
//         await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
//         return response;
//       } else {
//         setInvoices((prev) => [...prev, newInvoice]);
//         await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
//         return newInvoice;
//       }
//     } catch (err) {
//       console.error("Failed to create invoice from quote on server:", err);
//       setInvoices((prev) => [...prev, newInvoice]);
//       await updateQuoteStatus(quote.id, QuoteStatus.INVOICED);
//       return newInvoice;
//     }
//   };

//   const createStandaloneInvoice = async (
//     job: WeldingJob,
//     lineItems: LineItem[],
//     issueDate?: Date,
//     dueDate?: Date,
//     notes?: string,
//     includeTax: boolean = true
//   ) => {
//     const customerDetails: CustomerSnapshot = {
//       name: job.customerName,
//       contact: job.customerContact,
//       location: job.customerLocation,
//     };

//     // Calculate the subtotal from line items
//     const subTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

//     // Calculate tax and total based on includeTax parameter
//     const taxRate = includeTax ? 0.18 : 0;
//     const taxAmount = includeTax ? subTotal * taxRate : 0;
//     const totalAmount = subTotal + taxAmount;

//     const newInvoice: WeldingInvoice = {
//       id: uuidv4(),
//       weldingJobId: job.id,
//       invoiceNumber: `INV-${job.id.substring(0, 4)}-${invoices.filter((i) => i.weldingJobId === job.id).length + 1}`,
//       customerDetails,
//       lineItems,
//       subTotal,
//       taxRate,
//       taxAmount,
//       totalAmount,
//       amountPaid: 0,
//       balanceDue: totalAmount,
//       issueDate: issueDate ? issueDate.toISOString() : new Date().toISOString(),
//       dueDate: dueDate ? dueDate.toISOString() : undefined,
//       paymentsMade: [],
//       paymentStatus: InvoicePaymentStatus.UNPAID,
//       notes,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         const response = await httpClient(
//           `/welding/invoices/standalone/job/${job.id}`,
//           {
//             method: "POST",
//             headers,
//             body: JSON.stringify({
//               customerDetails,
//               lineItems: lineItems.map((item) => ({
//                 description: item.description,
//                 quantity: item.quantity,
//                 unitPrice: item.unitPrice,
//                 materialDetails: item.materialDetails,
//               })),
//               issueDate,
//               dueDate,
//               notes,
//               includeTax, // Include the tax parameter in the API call
//             }),
//           }
//         );

//         setInvoices((prev) => [...prev, response]);

//         return response;
//       } else {
//         setInvoices((prev) => [...prev, newInvoice]);
//         return newInvoice;
//       }
//     } catch (err) {
//       console.error("Failed to create standalone invoice on server:", err);
//       setInvoices((prev) => [...prev, newInvoice]);
//       return newInvoice;
//     }
//   };

//   const getInvoiceById = (invoiceId: string) => {
//     return invoices.find((inv) => inv.id === invoiceId);
//   };

//   const recordPaymentForInvoice = async (
//     invoiceId: string,
//     payment: Omit<Payment, "id">
//   ): Promise<Payment | null> => {
//     const invoice = getInvoiceById(invoiceId);
//     if (!invoice) {
//       toast({
//         title: "Error",
//         description: "Invoice not found.",
//         variant: "destructive",
//       });
//       return null;
//     }

//     const newPayment: Payment = { ...payment, id: uuidv4() };
//     const updatedPayments = [...(invoice.paymentsMade || []), newPayment];
//     const newAmountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
//     const newBalanceDue = invoice.totalAmount - newAmountPaid;

//     let newPaymentStatus = InvoicePaymentStatus.PARTIALLY_PAID;
//     if (newBalanceDue <= 0) {
//       newPaymentStatus = InvoicePaymentStatus.PAID;
//     } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
//       newPaymentStatus = InvoicePaymentStatus.OVERDUE;
//     }

//     const updatedInvoices = invoices.map((inv) =>
//       inv.id === invoiceId
//         ? {
//             ...inv,
//             paymentsMade: updatedPayments,
//             amountPaid: newAmountPaid,
//             balanceDue: newBalanceDue,
//             paymentStatus: newPaymentStatus,
//             updatedAt: new Date().toISOString(),
//           }
//         : inv
//     );
//     setInvoices(updatedInvoices);

//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         const serverPayment = await httpClient(
//           `/welding/invoices/${invoiceId}/payments`,
//           {
//             method: "POST",
//             headers,
//             body: JSON.stringify(payment),
//           }
//         );
//         return serverPayment;
//       }
//       return newPayment;
//     } catch (err) {
//       console.error("Failed to record payment on server:", err);
//       // even if server fails, return local payment to navigate
//       return newPayment;
//     }
//   };

//   const deleteInvoice = async (invoiceId: string) => {
//     try {
//       if (user && branchId) {
//         const headers = await getAuthHeaders();
//         await httpClient(`/welding/invoices/${invoiceId}`, {
//           method: "DELETE",
//           headers,
//         });
//       }

//       setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
//       toast({
//         title: "Success",
//         description: "Invoice deleted successfully",
//       });
//     } catch (error) {
//       console.error("Failed to delete invoice:", error);
//       toast({
//         title: "Error",
//         description: "Failed to delete invoice",
//         variant: "destructive",
//       });
//     }
//   };

//   // Sync operations
//   const syncQuotesWithBackend = async () => {
//     if (!user || !branchId) return;

//     setIsSyncing(true);
//     try {
//       await fetchQuotes();
//       setLastSyncTime(new Date());
//     } catch (err) {
//       console.error("Failed to sync quotes:", err);
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   const syncInvoicesWithBackend = async () => {
//     if (!user || !branchId) return;

//     setIsSyncing(true);
//     try {
//       await fetchInvoices();
//       setLastSyncTime(new Date());
//     } catch (err) {
//       console.error("Failed to sync invoices:", err);
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   return (
//     <WeldingFinancialContext.Provider
//       value={{
//         quotes,
//         invoices,
//         loadingQuotes,
//         loadingInvoices,
//         errorQuotes,
//         errorInvoices,
//         createQuote,
//         getQuoteById,
//         updateQuoteStatus,
//         updateQuote,
//         deleteQuote,
//         createInvoiceFromQuote,
//         createStandaloneInvoice,
//         getInvoiceById,
//         deleteInvoice,
//         recordPaymentForInvoice,
//         fetchQuotes,
//         fetchInvoices,
//         syncQuotesWithBackend,
//         syncInvoicesWithBackend,
//         isSyncing,
//         lastSyncTime,
//       }}
//     >
//       {children}
//     </WeldingFinancialContext.Provider>
//   );
// };

// export const useWeldingFinancials = (): WeldingFinancialContextType => {
//   const context = useContext(WeldingFinancialContext);
//   if (!context) {
//     throw new Error(
//       "useWeldingFinancials must be used within a WeldingFinancialProvider"
//     );
//   }
//   return context;
// };
